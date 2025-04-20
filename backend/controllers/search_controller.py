from fastapi import APIRouter, File, UploadFile, HTTPException
from ..services.elasticsearch_service import ElasticSearchService
import re
import os
from fastapi.responses import JSONResponse
from datetime import datetime, timezone

search_router = APIRouter(
    prefix="/search",
    tags=["search"],
    responses={404: {"description": "Not found"}},
)
es = ElasticSearchService()

def setup_test_idx():
    es.reindex()

def get_my_id():
    es.retrieve_document("my_id")

@search_router.post("/upload")
def upload(file: UploadFile = File(...)):
    url = ""
    try:
        contents = file.file.read()
        print(os.getcwd() + "/backend/misc/" + file.filename)
        with open(os.getcwd() + "/backend/misc/" + file.filename, "wb") as f:
            f.write(contents)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong")
    finally:
        file.file.close()
        url = es.ingest_document(file.filename)

    return {
        "message": f"Successfully uploaded {file.filename}",
        "gcs_url": url
    }


# @search_router.post("/")
def handle_search(query: str, file_type: str=None):
    filters, parsed_query = extract_filters(query)
    print(parsed_query)
    from_ = 0 # for pagination

    if parsed_query:
        search_query = {
            "must": {
                "multi_match": {
                    "query": parsed_query,
                    #"fields": ["name", "summary", "content"],
                    "fields": ["attachment.content"]
                }
            }
        }
    else:
        search_query = {"must": {"match_all": {}}}

    if file_type:
        file_type_filter = {"term": {"file_type": file_type.lower()}}
        # If your extract_filters function already returned filters that use a "filter" key,
        # merge the file_type filter with the existing ones.
        if "filter" in filters:
            if isinstance(filters["filter"], list):
                filters["filter"].append(file_type_filter)
            else:
                filters["filter"] = [filters["filter"], file_type_filter]
        else:
            filters["filter"] = [file_type_filter]

    query_body = {"bool": {}}
    if "must" in search_query:
        query_body["bool"]["must"] = search_query["must"]
    if "filter" in filters:
        query_body["bool"]["filter"] = filters["filter"]

    results = es.search(
        query={"bool": {**search_query, **filters}},
        # knn={
        #     "field": "embedding",
        #     "query_vector": es.get_embedding(parsed_query),
        #     "k": 10,
        #     "num_candidates": 50,
        #     **filters,
        # },
        # rank={"rrf": {}},
        # aggs={
        #     "category-agg": {
        #         "terms": {
        #             "field": "category.keyword",
        #         }
        #     },
        #     "year-agg": {
        #         "date_histogram": {
        #             "field": "updated_at",
        #             "calendar_interval": "year",
        #             "format": "yyyy",
        #         },
        #     },
        # },
        size=5,
        from_=from_,
    )
    # aggs = {
    #     "Category": {
    #         bucket["key"]: bucket["doc_count"]
    #         for bucket in results["aggregations"]["category-agg"]["buckets"]
    #     },
    #     "Year": {
    #         bucket["key_as_string"]: bucket["doc_count"]
    #         for bucket in results["aggregations"]["year-agg"]["buckets"]
    #         if bucket["doc_count"] > 0
    #     },
    #}
    return {
        "results": results["hits"]["hits"],
        "query": query,
        "from_": from_,
        "total": results["hits"]["total"]["value"],
        # "aggs": aggs,
    }

@search_router.post("/")
def get_dummy_files(query: str, file_type: str=None):
    print(f"Query: {query}, File Type: {file_type}")
    dummy_data = [
        {
            "id": 1,
            "user_id": 101,
            "filename": "sample1.pdf",
            "file_type": "pdf",
            "file_path": "/files/sample1.pdf",
            "source": "upload",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": 2,
            "user_id": 102,
            "filename": "translated_doc.docx",
            "file_type": "docx",
            "file_path": "/files/translated_doc.docx",
            "source": "translated",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": 3,
            "user_id": 103,
            "filename": "summary.txt",
            "file_type": "txt",
            "file_path": "/files/summary.txt",
            "source": "generated",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    return JSONResponse(content=dummy_data)

# Get all documents
@search_router.get("/")
def get_all_documents():
    pass

# Get number of files
# image will contains .jpg, .jpeg, .png
@search_router.get("/summary")
def get_files_summary():
    return {
        "pdf": 0,
        "docx": 0,
        "xlsx": 0,
        "image": 0
    }

async def retrieve_document(doc_id: str):
    document = es.retrieve_document(doc_id)
    return document
    # title = document["_source"]["name"]
    # paragraphs = document["_source"]["content"].split("\n")
    # return {"title": title, "paragraphs": paragraphs}


def extract_filters(query):
    filters = []

    filter_regex = r"category:([^\s]+)\s*"
    m = re.search(filter_regex, query)
    if m:
        filters.append(
            {
                "term": {"category.keyword": {"value": m.group(1)}},
            }
        )
        query = re.sub(filter_regex, "", query).strip()

    filter_regex = r"year:([^\s]+)\s*"
    m = re.search(filter_regex, query)
    if m:
        filters.append(
            {
                "range": {
                    "updated_at": {
                        "gte": f"{m.group(1)}||/y",
                        "lte": f"{m.group(1)}||/y",
                    }
                },
            }
        )
        query = re.sub(filter_regex, "", query).strip()
    filter_regex = r"file:([^\s]+)\s*"
    m = re.search(filter_regex, query)
    if m:
        filters.append(
            {
                "term": {"file_type": m.group(1).lower()}
            }
        )
        query = re.sub(filter_regex, "", query).strip()
    return {"filter": filters}, query
