import express, {Request, Response} from "express";
import mysql from "mysql2/promise";

const app = express();

// Configura EJS como a engine de renderização de templates
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

// Middleware para permitir dados no formato JSON
app.use(express.json());
// Middleware para permitir dados no formato URLENCODED
app.use(express.urlencoded({ extended: true }));

app.get('/users', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM users");
    return res.render('users/index', {
        users: rows
    });
});

app.get("/users/form", async function (req: Request, res: Response) {
    return res.render("users/form");
});

app.get("/users/edit/:id", async function (req: Request, res: Response) {
    const {id} = req.params;
    
        const [editor] = await connection.query(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );
        res.render("users/editUser", { user: editor[0]});  
});

app.get("/users/post", async function (req: Request, res: Response) {
    return res.render("users/post");
});

app.get("/", async function (req: Request, res: Response) {
    return res.render("users/login");
});

















app.post("/users/save", async function(req: Request, res: Response) {
    
    const body = req.body;

    if (body.senha !== body.confirmSenha) {
        return res.status(400).send('Senhas não conferem. Volte e Tente novamente.');
    }

    let isAtivo = 1;  
    if (body.isAtivo === 'false') {
        isAtivo = 0;  
    }
    
    const insertQuery = "INSERT INTO users (nome,cargo,email,senha,isAtivo) VALUES (?,?,?,?,?)";
    await connection.query(insertQuery, [body.nome,body.cargo,body.email,body.senha,isAtivo]);

    res.redirect("/users");
});

app.post("/users/delete/:id", async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM users WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/users");
});

app.post("/users/edit/:id", async function (req: Request, res: Response) {
    const {id} = req.params;  
    const body = req.body; 

    let isAtivo = 0;  
    if (body.isAtivo === 'true') {
        isAtivo = 1;   
    }
        const sqlUpdate = "UPDATE users SET nome = ?, email = ?, cargo = ?, senha = ?, isAtivo = ? WHERE id = ?";
        await connection.query(sqlUpdate, [body.nome, body.email, body.cargo, body.senha, isAtivo, id]);

        res.redirect("/users");
});

app.post("/users/edit/:id", async function (req: Request, res: Response) {
    const {id} = req.params;  
    const body = req.body; 

    let isAtivo = 1;  
    if (body.isActive === 'false') {
        isAtivo = 0;   
    }

        const sqlUpdate = "UPDATE users SET nome = ?, email = ?, cargo = ?, senha = ?, isAtivo = ? WHERE id = ?";
        await connection.query(sqlUpdate, [body.nome, body.email, body.cargo, body.senha, isAtivo, id]);

        res.redirect("/users");
});

app.post("/users/login", async function (req: Request, res: Response){
    const {email,senha} = req.body;

    try {
        // 1. Buscar o usuário pelo email e senha no banco de dados
        const [rows]: any = await connection.query(
            "SELECT * FROM users WHERE email = ? AND senha = ?",
            [email, senha]
        );

        // Verificar se encontrou o usuário (checando se `rows` contém resultados)
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Usuário ou senha incorretos' });
        }

        // Se o usuário foi encontrado, redirecionar para a listagem de usuários
        res.redirect("/users");

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro no servidor' });
    }
});


app.listen('3000', () => console.log("Server is listening on port 3000"));