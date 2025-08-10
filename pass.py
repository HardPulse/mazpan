from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
new_password = "454204MU"
hashed_password = pwd_context.hash(new_password)
with open("pass.txt", "w") as f:
    f.write(hashed_password)