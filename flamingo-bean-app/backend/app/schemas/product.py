from pydantic import BaseModel, Field


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


class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float = Field(ge=0)
    size: str
    image_url: str = ""
    roast_level: str = ""
    origin: str = ""
    active: bool = True


class ProductUpdate(BaseModel):
    name: str
    description: str
    category: str
    price: float = Field(ge=0)
    image_url: str = ""
    roast_level: str = ""
    origin: str = ""
    size: str
    active: bool


class ProductActiveUpdate(BaseModel):
    active: bool
