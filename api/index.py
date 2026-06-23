"""Vercel 서버리스 진입점 — FastAPI ASGI 앱을 그대로 노출."""
import os
import sys

# 프로젝트 루트를 import 경로에 추가 (app 패키지 인식)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.main import app  # noqa: E402  (Vercel이 이 ASGI 'app'을 서빙)
