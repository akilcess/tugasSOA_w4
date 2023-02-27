const mysql = require("mysql");

class Database {
    constructor(config) {
        /**
         * NOTE:
         * pool.query akan otomatis melakukan request koneksi dari mysql Pool nya,
         * melakukan query dan akan melepaskan koneksinya kembali
         * pool.query() adalah shortcut untuk pool.getConnection() + connection.query() + connection.release().
         * sehingga pada pool tidak perlu digunakan conn.getConnection untuk mendapatkan connection dan conn.release untuk melepaskan koneksi.
         * Pool akan melakukan getConnection dan release connection secara otomatis #CMIIW
         * */
        this.pool = mysql.createPool(config);
    }

    query() {
        return new Promise((resolve, reject) => {
            this.pool.query(...arguments, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
}

let db = new Database({
    host: "localhost",
    user: "root",
    password: "",
    database: "tugasminggu4",
});

module.exports = db;
