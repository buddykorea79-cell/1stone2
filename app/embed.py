import os
from openai import OpenAI

EMBED_MODEL = "text-embedding-3-large"
EMBED_DIM = 3072

_client = None


def get_client():
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    return _client


def build_text(service: dict) -> str:
    """서비스의 자격/내용을 대표하는 텍스트 결합 (임베딩 입력)."""
    parts = [
        service.get("serv_nm") or "",
        service.get("summary") or "",
        service.get("target_detail") or "",
        service.get("select_criteria") or "",
    ]
    tags = []
    for key in ("life_cycles", "household_types", "interest_themes"):
        v = service.get(key)
        if v:
            tags.extend(v)
    if tags:
        parts.append(" ".join(tags))
    text = "\n".join(p.strip() for p in parts if p and p.strip())
    return text[:1800]  # 토큰 폭주 방지


def embed_texts(texts, batch_size=50):
    client = get_client()
    out = []
    for i in range(0, len(texts), batch_size):
        batch = [t if t.strip() else " " for t in texts[i:i + batch_size]]
        resp = client.embeddings.create(model=EMBED_MODEL, input=batch)
        out.extend(d.embedding for d in resp.data)
    return out


def embed_query(text: str):
    client = get_client()
    resp = client.embeddings.create(model=EMBED_MODEL, input=[text or " "])
    return resp.data[0].embedding
