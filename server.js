import express from "express";
import next from "next";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
    .then(() => {
        const expressApp = express();

        expressApp.use(cors({
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["*"],
            maxAge: 86400,
        }));

        expressApp.options('*', cors());

        expressApp.get("/p/:id", (req, res) => {
            const actualPage = "/post";
            const queryParams = { title: req.params.id };
            app.render(req, res, actualPage, queryParams);
        });

        expressApp.use((req, res) => {
            return handle(req, res);
        });

        const server = http.createServer(expressApp);

        server.listen(port, () => {
            console.log(
                `> Server running at http://localhost:${port} (${dev ? "development" : "production"})`
            );
        });
    })
    .catch((ex) => {
        console.error("Server failed to start:", ex);
        process.exit(1);
    });
