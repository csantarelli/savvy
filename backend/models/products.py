__author__ = 'Colin'

import logging

from backend.database import DB


logger = logging.getLogger("savvy.models.products")


class Product(object):
    """Class for products."""

    def __init__(self, product_id=None, description=None, tags=None, price_reliability=None):
        self.product_id = product_id
        self.description = description
        self.tags = tags
        self.price_reliability = price_reliability


class ProductDB(DB):
    """Class to connect to the Products Datastore."""

    def get(self, id):
        from bson.objectid import ObjectId
        from backend.models.voting import VotingDB
        try:
            product = dict(self.db.products.find({"_id": ObjectId(id)}).next())
        except StopIteration:
            raise Exception("Product with ID '{}' not found.".format(id))
        product_id = product["product_id"] = str(product.pop("_id"))
        product["image"] = self.get_image(product_id=product_id)
        product["score"] = VotingDB().get_product_score(product_id=product_id)
        return product

    def search(self, query):
        """Returns a list of matching products."""
        import re
        results = []
        for result in self.db.products.find({"$or": [{"description": re.compile(".*{}.*".format(query), re.IGNORECASE)}, {"tags": re.compile(".*{}.*".format(query), re.IGNORECASE)}]}):
            result = dict(result)
            product_id = result["product_id"] = str(result.pop("_id"))
            result["image"] = self.get_image(product_id=product_id)
            results.append(result)
        return results

    def add_product(self, description, tags=None):
        """Adds a product to the database."""
        tags = tags or []
        result = self.db.products.update_one({"description": description},
                                             {"$addToSet": {"tags": {"$each": tags}}},
                                             upsert=True)
        if result.upserted_id:
            product_id = str(result.upserted_id)
        else:
            result = self.db.products.find_one({"description": description})
            product_id = str(result["_id"])
        return product_id

    def add_tag(self, product_id, tag):
        """Adds a product to the database."""
        from bson.objectid import ObjectId
        result = self.db.products.update_one({"_id": ObjectId(product_id)},
                                             {"$addToSet": {"tags": tag}})
        if result.matched_count > 0:
            return True
        return False

    def get_image(self, product_id):
        result = self.db.prices.find_one({
            "product_id": product_id,
            "image": {"$exists": True, "$ne": None}
        })
        if not result:
            return None
        return result["image"]
