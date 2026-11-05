import sqlite3
c = sqlite3.connect(r'd:\Pscryp-backend\web-gold-backend\db.sqlite3')
rows = c.execute("select name from sqlite_master where type='table'").fetchall()
print("tables:", [r[0] for r in rows])
