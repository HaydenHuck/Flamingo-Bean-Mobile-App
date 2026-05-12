from pydantic import BaseModel


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    category: str
    price: float
    image_url: str
    roast_level: str
    origin: str
    size: str
    active: bool

