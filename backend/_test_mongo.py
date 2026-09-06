import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

URI = "mongodb+srv://picasogargari_db_user:NKHSKKf9zRiYYVTG@cluster0.92tkprs.mongodb.net/?appName=Cluster0"

async def main():
    client = AsyncIOMotorClient(URI, serverSelectionTimeoutMS=8000)
    try:
        res = await client.admin.command("ping")
        print("PING_OK", res)
        db = client["Sojaru"]
        await db.__test__.insert_one({"hello": "world"})
        await db.__test__.delete_many({})
        print("WRITE_OK on DB 'Sojaru'")
    except Exception as e:
        print("ERROR", type(e).__name__, str(e))
    finally:
        client.close()

asyncio.run(main())
