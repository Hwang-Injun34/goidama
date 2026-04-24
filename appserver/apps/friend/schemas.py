from pydantic import BaseModel 
import uuid 
from datetime import datetime 

class FriendResponse(BaseModel):
    id: uuid.UUID 
    friend_code: str 
    friend_since: datetime # 친구가 된 날짜 

class PendingRequestResponse(BaseModel):
    request_id: int
    requester_id: uuid.UUID
    requester_nickname: str
    requester_code: str
    created_at: datetime