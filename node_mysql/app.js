const express = require("express");
let cors = require('cors');
const Yup = require ('yup');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { eAdmin } = require('./middlewares/auth');
const User = require('./models/User');


const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization")
    app.use(cors());
    next();
});

app.get("/users", eAdmin , async (req, res) => {

    await User.findAll({
        attributes: ['id', 'name', 'email', 'password'],
        order: [['id', 'DESC']]
    })
        .then((users) => {
            return res.json({
                erro: false,
                users
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhum usuário encontrado!"
            });
        });
});

app.get("/user/:id",eAdmin, async (req, res) => {
    const { id } = req.params;

    //await User.findAll({ where: { id: id } })
    await User.findByPk(id)
        .then((user) => {
            return res.json({
                erro: false,
                user: user
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhum usuário encontrado!"
            });
        });
});

app.post("/user",  async (req, res) => {
    let dados = req.body;
    dados.password = await bcrypt.hash(dados.password, 8);

    await User.create(dados)
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Usuário cadastrado com sucesso!"
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Usuário não cadastrado com sucesso!"
            });
        });
});

app.put("/user", eAdmin, async (req, res) => {
    const { id } = req.body;

    await User.update(req.body, { where: { id } })
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Usuário editado com sucesso!"
            });

        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Usuário não editado com sucesso!"
            });
        });
});

app.put("/user-senha", eAdmin, async (req, res) => {
    const { id, password } = req.body;

    var senhaCrypt = await bcrypt.hash(password, 8);

    await User.update({ password: senhaCrypt }, { where: { id } })
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Senha editada com sucesso!"
            });

        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Senha não editada com sucesso!"
            });
        });
});

app.delete("/user/:id", eAdmin, async (req, res) => {
    const { id } = req.params;

    await User.destroy({ where: { id } })
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Usuário apagado com sucesso!"
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Usuário não apagado com sucesso!"
            });
        });
});

app.post('/login', async (req, res) => {

    const schema = Yup.object().shape({
        name: Yup.string()
                .required(),
        email: Yup.string()
                .required(),
        password: Yup.string()
                .required()
                .min(6)
    });

    if(!(await schema.isValid(req.body))){
            return res.status(400).json({
                erro:true,
                mensagem: "Erro: Preencha todos os campos!"
            })

            
    }   
    
    const user = await User.findOne({
        attributes: ['id', 'name', 'email', 'password'],
        where: {
            email: req.body.email
        }
    });
    if (user === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Usuário ou a senha incorreta!"
        });
    };

    if (!(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Usuário ou a senha incorreta!"
        });
    };

    var token = jwt.sign({ id: user.id }, process.env.SECRET, {
        //expiresIn: 600 // 10min
        expiresIn: '7d', // 7 dia
    });

    return res.json({
        erro: false,
        mensagem: "Login realizado com sucesso!",
        token
    });
});

app.get("/val-token", eAdmin, async (req, res) => {
    await User.findByPk(req.userId, { attributes: ['id', 'name', 'email'] })
        .then((user) => {
            return res.json({
                erro: false,
                user
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Necessário realizar o login para acessar a página!"
            });
        });

});

app.listen(3000, () => {
    console.log("Servidor iniciado na porta 3000: http://localhost:3000");
});