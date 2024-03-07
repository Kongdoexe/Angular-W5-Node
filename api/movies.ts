import mysql from "mysql";
import express from "express";
import { conn, queryAsync } from "../dbconnect";
import { Movie, Person } from "../model/model";

export const router = express.Router();

router.get("/", (req, res) => {
  let sql = "SELECT * FROM Movies";

  let dataP: Person[] = [];
  let dataC: Person[] = [];

  conn.query(sql, (err, Result_Movie) => {
    if (err) {
      console.error("Error querying Creators:", err);
      return;
    }

    sql =
      "SELECT Person.name AS creators_name FROM Movies JOIN Creators ON Movies.mid = Creators.mid JOIN Person ON Creators.uid = Person.uid";

    conn.query(sql, (err, Result_Creators) => {
      if (err) {
        console.error("Error querying Creators:", err);
        return;
      }

      dataC = Result_Creators;
      sql =
        "SELECT Person.name AS star_name FROM Movies JOIN Stars ON Movies.mid = Stars.mid JOIN Person ON Stars.uid = Person.uid";

      conn.query(sql, (err, Result_Stars) => {
        if (err) {
          console.error("Error querying Stars:", err);
          return;
        }

        dataP = Result_Stars;

        const format = Result_Movie.map((format: { Mid: any; Title: any; type: string; year: any; runtime: any; Genre: any; rating : any ;creator_name: any; deatil: any; poster: any;}) => {
            const stars = dataP.map((star: any) => star.star_name);
            const Creators = dataC.map((crator : any) => crator.creators_name)

            return {
              mid: format.Mid,
              title: format.Title,
              type: format.type,
              year: format.year,
              runtime: format.runtime,
              Genre: format.Genre.split(","),
              Rating: format.rating,
              Creators: Creators,
              Stars: stars,
              detail: format.deatil,
              poster: format.poster,
            };
          }
        );

        res.status(200).send({ result: format });
      });
    });
  });
});

router.post("/Insert", (req, res) => {
  const body: Movie = req.body;
  let sql;

  sql = "SELECT * FROM Movies where Title = ?";

  conn.query(sql, [body.Title], (err, result) => {
    if (err) {
      console.error("Error!");
      return;
    }

    if (result == 0) {
      sql =
        "INSERT INTO Movies (`Title`, `year`, `runtime`, `Genre`, `detail`, `poster`) VALUES (?, ?, ?, ?, ?, ?)";

      sql = mysql.format(sql, [
        body.Title,
        body.year,
        body.runtime,
        body.Genre,
        body.detail,
        body.poster,
      ]);

      conn.query(sql, (err, result) => {
        if (err) {
          console.error("Insert Pooo");
          return;
        }

        res.status(200).json({ result: result });
      });
    } else {
      res.status(500).json({ error: "Error Is Title have" });
    }
  });
});

router.put("/Edit/:mid", async (req, res) => {
  const mid = req.params.mid;
  const body: Movie = req.body;
  let sql;

  sql = "SELECT * FROM Movies where mid = ?";

  sql = mysql.format(sql, [mid]);

  let result = await queryAsync(sql);

  const MovieOrigin: Movie = JSON.parse(JSON.stringify(result));

  const update = { ...MovieOrigin, ...body };

  sql =
    "UPDATE `Movies` SET `Title`=?,`type`=?,`year`=?,`runtime`=?,`Genre`=?,`detail`=?,`poster`=? WHERE mid = ?";

  sql = mysql.format(sql, [
    update.Title,
    update.type,
    update.year,
    update.runtime,
    update.Genre,
    update.detail,
    update.poster,
    mid,
  ]);

  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

router.delete("/Delete/:mid", (req, res) => {
  const mid = req.params.mid;

  let sql = "DELETE FROM Movies where mid = ?";

  sql = mysql.format(sql, [mid]);

  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error!");
      return;
    }

    res.status(200).json({ result: result });
  });
});
