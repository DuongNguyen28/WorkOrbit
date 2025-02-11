from fastapi import APIRouter
from services.elasticsearch_service import ElasticSearchService
import re

router = APIRouter(
    prefix="/search",
    tags=["search"],
    responses={404: {"description": "Not found"}},
)
es = ElasticSearchService()


@router.post("/")
def handle_search(query: str):
    filters, parsed_query = extract_filters(query)
    from_ = 0  # for pagination

    if parsed_query:
        search_query = {
            "must": {
                "multi_match": {
                    "query": parsed_query,
                    "fields": ["name", "summary", "content"],
                }
            }
        }
    else:
        search_query = {"must": {"match_all": {}}}

    results = es.search(
        query={"bool": {**search_query, **filters}},
        knn={
            "field": "embedding",
            "query_vector": es.get_embedding(parsed_query),
            "k": 10,
            "num_candidates": 50,
            **filters,
        },
        rank={"rrf": {}},
        aggs={
            "category-agg": {
                "terms": {
                    "field": "category.keyword",
                }
            },
            "year-agg": {
                "date_histogram": {
                    "field": "updated_at",
                    "calendar_interval": "year",
                    "format": "yyyy",
                },
            },
        },
        size=5,
        from_=from_,
    )
    aggs = {
        "Category": {
            bucket["key"]: bucket["doc_count"]
            for bucket in results["aggregations"]["category-agg"]["buckets"]
        },
        "Year": {
            bucket["key_as_string"]: bucket["doc_count"]
            for bucket in results["aggregations"]["year-agg"]["buckets"]
            if bucket["doc_count"] > 0
        },
    }
    return {
        "results": results["hits"]["hits"],
        "query": query,
        "from_": from_,
        "total": results["hits"]["total"]["value"],
        "aggs": aggs,
    }


@router.get("/documents/{doc_id}")
async def retrieve_document(doc_id: str):
    document = es.retrieve_document(doc_id)
    title = document["_source"]["name"]
    paragraphs = document["_source"]["content"].split("\n")
    return {"title": title, "paragraphs": paragraphs}


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

    return {"filter": filters}, query
