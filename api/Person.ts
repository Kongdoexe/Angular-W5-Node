import mysql from "mysql";
import express from "express";
import { conn, queryAsync } from "../dbconnect";
import { Movie, Object, Person } from "../model/model";

export const router = express.Router();

router.get("/", (req, res) => {
  //SELECT SHOW TYPE
  let sql = "SELECT * FROM Person";

  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error!");
      return;
    }

    const transformedResult = result.map(
      (person: {
        uid: any;
        name: any;
        type: string;
        detail: any;
        image: any;
      }) => ({
        uid: person.uid,
        name: person.name,
        type: person.type.split(","),
        detail: person.detail,
        image: person.image,
      })
    );

    res.status(200).json({ result: transformedResult });
  });
});

router.post("/Insert", (req, res) => {
  const body: Person = req.body;
  const typeString = JSON.stringify(body.type).replace(/['"\[\]]+/g, "");
  let sql;

  sql =
    "INSERT INTO `Person`(`name`, `type`, `detail`, `image`) VALUES (?, ?, ?, ?)";
  sql = mysql.format(sql, [body.name, typeString, body.detail, body.image]);

  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error!", err);
      res.status(500).json({ error: "Error!" });
      return;
    }

    const personId = result.insertId;

    if (body.mid) {
      sql = "SELECT * FROM Movies WHERE mid = ?";
      sql = mysql.format(sql, [body.mid]);

      conn.query(sql, (err, result) => {
        if (err) {
          console.error("Error!", err);
          res.status(500).json({ error: "Error!" });
          return;
        }

        if (result.length > 0) {
          let starsOrCreators = "Stars";

          if (req.query.creators !== undefined) {
            starsOrCreators = "Creators";
          }

          const insertTableSql = `INSERT INTO ${starsOrCreators} (mid, uid) VALUES (?, ?)`;
          const insertTableValues = [body.mid, personId];

          conn.query(insertTableSql, insertTableValues, (err, insertResult) => {
            if (err) {
              console.error("Error!", err);
              res.status(500).json({ error: "Error!" });
              return;
            }

            const successMessage = `Success in Table Person - ${starsOrCreators}`;
            res
              .status(200)
              .json({ insert: successMessage, result: insertResult });
          });
        } else {
          res.status(404).json({
            insert: "Success in Table Person",
            error: "Movie ID not found!",
          });
        }
      });
    } else {
      res.status(200).json({
        insert: "Success in Table Person",
        insert_to_Stars_creators: "Error: Movie ID is not provided",
      });
    }
  });
});

router.put("/Edit/:id", async (req, res) => {
  const body: Person = req.body;
  const id = req.params.id;
  const typeString = JSON.stringify(body.type).replace(/['"\[\]]+/g, "");

  body.type = typeString;

  let sql = "SELECT * FROM Person where uid = ?";

  sql = mysql.format(sql, [id]);

  let result = await queryAsync(sql);

  if (result) {
    const OriginData: Person = JSON.parse(JSON.stringify(result));

    const update_ = { ...OriginData, ...body };

    sql =
      "UPDATE Person SET name = ? , type = ? , detail = ?, image = ? where uid = ?";

    sql = mysql.format(sql, [
      update_.name,
      update_.type,
      update_.detail,
      update_.image,
      id,
    ]);

    conn.query(sql, (err, result) => {
      if (err) {
        console.error("Error!");
        res.status(500).json({ error: "Error!" });
        return;
      }
      if (result.affectedRows > 0) {
        res.status(200).json({ result: result });
      } else {
        res.status(500).json({ error: "Not Have uid" });
      }
    });
  } else {
    res.status(500).json({ error: "Not Found Person" });
  }
});

router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  const pare = parseInt(id);

  let sql = "DELETE FROM Person WHERE uid = ?";

  sql = mysql.format(sql, [pare]);

  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error!");
      res.status(500).json({ error: "Error" });
      return;
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ success: "Delete Success!" });
    } else {
      res.status(500).json({ error: "Person id Not Found!" });
    }
  });
});

router.post("/Insert/hands", (req, res) => {
  const body: Object = req.body;
  let sql;

  sql = "SELECT * FROM Movies where mid = ?";

  sql = mysql.format(sql, [body.mid]);

  conn.query(sql, (err, result_Movie) => {
    if (err) {
      console.error("Error!", err);
      res.status(500).json({ error: "Error!" });
      return;
    }

    if (result_Movie.length > 0) {
      sql = "SELECT * FROM Person where uid = ?";
      sql = mysql.format(sql, [body.uid]);

      conn.query(sql, (err, result_Person) => {
        if (err) {
          console.error("Error!", err);
          res.status(500).json({ error: "Error!" });
          return;
        }

        if (result_Person.length > 0) {
          let starsOrCreators = "Stars";

          if (req.query.creators !== undefined) {
            starsOrCreators = "Creators";
          }

          sql = `INSERT INTO ${starsOrCreators} (mid , uid) VALUES(? ,?)`;
          sql = mysql.format(sql, [body.mid, body.uid]);

          conn.query(sql, (err, result_Insert) => {
            if (err) {
              console.error("Error!", err);
              res.status(500).json({ error: "Error!" });
              return;
            }

            res.status(200).json({ insert: "Success!", result: result_Insert });
          });
        } else {
          res.status(500).json({ error: "Person id Not Found" });
        }
      });
    } else {
      res.status(500).json({ error: "Movie id Not Found" });
    }
  });
});

router.get("/Stars_Creators", (req, res) => {
  let starsOrCreators = "Stars";

  if (req.query.creators !== undefined) {
    starsOrCreators = "Creators";
  }

  let sql = `SELECT ${starsOrCreators}.*, Person.name AS person_name, Movies.Title AS movie_name FROM ${starsOrCreators}, Person, Movies WHERE ${starsOrCreators}.uid = Person.uid AND Movies.mid = ${starsOrCreators}.mid`;

  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error!", err);
      res.status(500).json({ error: "Error!" });
      return 
    }

    if (result.length > 0) {
      const formattedResult = result.map(
        (person: { sid: any; person_name: any; movie_name: any }) => ({
          sid: person.sid,
          name: person.person_name,
          movie: person.movie_name,
        })
      );

      res.status(200).json({ result: formattedResult });
    } else {
      res
        .status(404)
        .json({ error: `No data found in the ${starsOrCreators} table` });
    }
  });
});

router.delete("/Stars_Creators/:id", (req, res) => {
  const id = req.params.id
  let starsOrCreators = "Stars";
  let starsOrCreatorsID = "sid";

  if (req.query.creators !== undefined) {
    starsOrCreators = "Creators";
    starsOrCreatorsID = "cid";
  }

  let sql = `DELETE FROM ${starsOrCreators} where ${starsOrCreatorsID} = ?`;

  sql = mysql.format(sql , [id])
  
  conn.query(sql , (err, result) => {
    if(err) {
      console.error("Error! " , err);
      res.status(500).json({ error : "Error!" })
      return 
    }

    if(result.affectedRows > 0){
      res.status(200).json({ success : "success!" })
    } else {
      res.status(500).json({ error : `Error! ${starsOrCreatorsID} ID NOT FOUND IN ${starsOrCreators}` })
    }
  })
});
