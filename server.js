"use strict";

require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const superagent = require ("superagent");
app.use(express.json());
app.use(express.urlencoded({extended : true}));
var methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(express.static('./public'));
const pg = require ("pg");
app.set("view engine" , "ejs");
const client = new pg.Client(process.env.DATABASE_URL);


app.get("/",(req,res)=>{
    let SQL="SELECT * FROM cards";
    client.query(SQL)
    .then(data=>{
        res.render("pages/index",{results:data.rows});
    })
})

app.post("/favorite",(req,res)=>{
    var url;
    if(req.body.searchtype === "name")
    {
        url=`https://digimon-api.herokuapp.com/api/digimon/name/agumon`;
    }else if(req.body.searchtype === "level")
    {
        url=`https://digimon-api.herokuapp.com/api/digimon/level/rookie`;
    }
superagent.get(url)
.then(data=>{
    let dataarr=data.body.items;
    let cardresult=dataarr.map(value=>{
        let cardobject=new Card(value);
        return cardobject;
    })
    console.log(cardresult);
    res.render("pages/files/favorite",{cards:cardresult});
})
})

app.post("/add",(req,res)=>{
    let{name,image,level}=req.body;
    let SQL="INSERT INTO cards(name,img,level) VALUES($1,$2,$3);";
    let safevalues=[name,image,level];
    client.query(SQL,safevalues)
    .then(()=>{
        res.redirect("/");
    })
})

app.get("/cards/:id",(req,res)=>{
    let SQL="SELECT * FROM cards WHERE id=$1";
    let safevalues=[req.params.id];
    client.query(SQL,safevalues)
    .then(result=>{
        res.render("pages/files/details",{cards:result.rows});
    })
})

app.put("/update/:id",(req,res)=>{
    let{name,image,level}=req.body;
    let SQL="UPDATE cards set name=$2,img=$3,title=$4 WHERE id=$1;";
    let safevalues=[req.params.id,name,image,level];
    client.query(SQL,safevalues)
    .then(()=>{
        res.redirect("/");
    })
})

app.delete("/delete/:id",(req,res)=>{
    let SQL = "DELETE FROM cards WHERE id=$1";
    let safevalues=[req.params.id];
    client.query(SQL,safevalues)
    .then(()=>{
        res.redirect("/");
    })
})

app.get("/" ,(req,res)=>{
    res.render("pages/index");
})

app.use("*",(req,res)=>{
    res.status(404).send("page not found");
})

app.use(Error, (req,res)=>{
    res.status(500).send(Error);
})

client.connect()
.then(app.listen(PORT, ()=>{
    console.log(`port is running at port ${PORT}`);
}))

function Card(card){
    this.name = card.name;
    this.image =card.img;
    this.level= card.level;
}