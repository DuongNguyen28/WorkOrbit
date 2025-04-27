from fastapi import APIRouter, File as FastAPIFile, UploadFile, HTTPException, Depends
from ..services.elasticsearch_service import ElasticSearchService
import re
import os
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
load_dotenv()
from ..models.file import File
from ..schemas.file import FileOut
from ..controllers.auth_controller import get_db
from sqlalchemy.orm import Session

search_router = APIRouter(
    prefix="/search",
    tags=["search"],
    responses={404: {"description": "Not found"}},
)
es = ElasticSearchService()

# def setup_test_idx():
#     es.reindex()

# def get_my_id():
#     es.retrieve_document("my_id")

EST = timezone(timedelta(hours=-5), name="EST")

@search_router.post("/upload")
def upload(file: UploadFile = FastAPIFile(...), db: Session = Depends(get_db)):
    try:
        contents = file.file.read()
        print(os.getcwd() + "/backend/misc/" + file.filename)
        with open(os.getcwd() + "/backend/misc/" + file.filename, "wb") as f:
            f.write(contents)

        file.file.close()
        file_type = file.filename.split(".")[-1].lower()

        if file_type == "pdf":
            file_type = "pdf"
        elif file_type == "docx":
            file_type = "docx"
        elif file_type == "xlsx":
            file_type = "xlsx"
        elif file_type in {"jpg", "jpeg", "png", "image", "img"}:
            file_type = "image"
        else:
            file_type = "uncategorized"
        metadata = {
            "user_id": 1,
            "filename": file.filename,
            "file_type": file_type,
            "source": "upload",
            "uploaded_at": datetime.now(EST),
            "file_path": "",
        }

        new_file = File(**metadata)
        db.add(new_file)
        db.commit()
        db.refresh(new_file)

        # Index and upload to GCS
        gcs_url = es.ingest_document(
            filename=file.filename,
            file_type=new_file.file_type,
            sql_id=new_file.id
        )

        # Update GCS URL in SQL
        new_file.file_path = gcs_url
        db.commit()

        return FileOut.model_validate(new_file).model_dump()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@search_router.post("/")
def handle_search(query: str=None, file_type: str=None, db: Session = Depends(get_db)):
    filters, parsed_query = extract_filters(query)
    print(parsed_query)
    from_ = 0 # for pagination

    if parsed_query:
        search_query = {
            "must": {
                "multi_match": {
                    "query": parsed_query,
                    "fields": ["name", "attachment.content"]
                }
            }
        }
    else:
        search_query = {"must": {"match_all": {}}}

    if file_type:
        file_type_filter = {"term": {"file_type": file_type.lower()}}

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

    sql_ids = [hit["_source"]["sql_id"] for hit in results["hits"]["hits"] if "_source" in hit and "sql_id" in hit["_source"]]

    files = db.query(File).filter(File.id.in_(sql_ids)).all()

    # return {
    #     "results": results["hits"]["hits"],
    #     "query": query,
    #     "from_": from_,
    #     "total": results["hits"]["total"]["value"],
    #     # "aggs": aggs,
    # }

    return [FileOut.model_validate(file).model_dump() for file in files]

# async def retrieve_document(doc_id: str):
#     document = es.retrieve_document(doc_id)
#     return document
#     # title = document["_source"]["name"]
#     # paragraphs = document["_source"]["content"].split("\n")
#     # return {"title": title, "paragraphs": paragraphs}


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
