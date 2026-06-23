"""오프라인 인덱싱: 전체 서비스 임베딩을 생성해 디스크에 저장."""
import json
import sys
import numpy as np

from app.embed import build_text, embed_texts, EMBED_DIM

with open("welfare_services_llm_final.json", encoding="utf-8") as f:
    data = json.load(f)

services = data["services"]
ids = [s["serv_id"] for s in services]
texts = [build_text(s) for s in services]

print(f"임베딩 대상: {len(texts)}건", flush=True)

vectors = []
done = 0
batch = 50
for i in range(0, len(texts), batch):
    chunk = texts[i:i + batch]
    vecs = embed_texts(chunk, batch_size=batch)
    vectors.extend(vecs)
    done += len(chunk)
    print(f"  진행 {done}/{len(texts)}", flush=True)

arr = np.array(vectors, dtype=np.float32)
# 정규화(코사인 유사도를 내적으로 계산하기 위함)
norms = np.linalg.norm(arr, axis=1, keepdims=True)
norms[norms == 0] = 1.0
arr = arr / norms

np.save("embeddings.npy", arr)
with open("embedding_ids.json", "w", encoding="utf-8") as f:
    json.dump(ids, f, ensure_ascii=False)

print(f"저장 완료: embeddings.npy {arr.shape}, embedding_ids.json {len(ids)}건")
