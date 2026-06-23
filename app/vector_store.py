import json
from pathlib import Path
import numpy as np

BASE = Path(__file__).resolve().parent.parent
EMB_PATH = BASE / "embeddings.npy"
IDS_PATH = BASE / "embedding_ids.json"

_matrix = None          # (N, D) L2-normalized
_id_to_row = None       # serv_id -> row index


def is_ready() -> bool:
    return EMB_PATH.exists() and IDS_PATH.exists()


def _load():
    global _matrix, _id_to_row
    if _matrix is None:
        _matrix = np.load(EMB_PATH)
        with open(IDS_PATH, encoding="utf-8") as f:
            ids = json.load(f)
        _id_to_row = {sid: i for i, sid in enumerate(ids)}
    return _matrix, _id_to_row


def rerank(candidates, query_vec, min_score=None):
    """candidates(서비스 dict 리스트)를 query_vec과의 코사인 유사도로 재정렬.
    각 결과에 _score(0~1) 부여. min_score 이상만 유지(None이면 전체 유지)."""
    if not candidates:
        return []
    matrix, id_to_row = _load()

    q = np.asarray(query_vec, dtype=np.float32)
    n = np.linalg.norm(q)
    if n > 0:
        q = q / n

    scored = []
    for s in candidates:
        row = id_to_row.get(s["serv_id"])
        if row is None:
            score = -1.0
        else:
            score = float(np.dot(matrix[row], q))
        item = dict(s)
        item["_score"] = round(score, 4)
        scored.append((score, item))

    scored.sort(key=lambda x: -x[0])
    out = [item for sc, item in scored if (min_score is None or sc >= min_score)]
    return out
