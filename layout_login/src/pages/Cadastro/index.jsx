import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import '../Cadastro/index.css';
import axios from 'axios';
import api from '../../config/configApi'

function Cadastro() {

    const [user, setUser] = useState({
        nome: '',
        email: '',
        password: ''
    });

    const inputValor = e => setUser({ ...user, [e.target.name]: e.target.value });

    const cadastrar = async e => {
        e.preventDefault();
        console.log(user)

        const headers = {
            'headers': {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }

        await api.post("/user", user, headers)
            .then((response) => {
                console.log(response.data.mensagem)
            }).catch((err) => {
                if (err.response) {
                    console.log(err.response.data.mensagem)
                } else {
                    console.log('Erro: tente mais tarde...')
                }
            })
    }
    return (
        <div>
            <div className="container">
                <h1>Cadastro</h1>

                <form onSubmit={cadastrar}>
                    <div className="box">
                        <div className="container-label">
                            <label>Nome</label>
                        </div>
                        <div className="container-input">
                            <input type='text' name='nome' placeholder='Digite seu nome' onChange={inputValor} />
                        </div>
                    </div>
                    <div className="box">
                        <div className="container-label">
                            <label>Email</label>
                        </div>
                        <div className="container-input">
                            <input type='text' name='email' placeholder='Digite seu email' onChange={inputValor} />
                        </div>
                    </div>
                    <div className="box">
                        <div className="container-label">
                            <label>Senha</label>
                        </div>
                        <div className="container-input">
                            <input type='password' name='password' placeholder='Digite sua senha' autoComplete='on' onChange={inputValor} />
                            <button type='submit' id='btn-cad'>Cadastrar-se</button>
                        </div>
                    </div>
                </form>
                <div className="text-cad">
                    <span>Já tem uma conta? <Link to='/login'>Entrar</Link></span>
                </div>
            </div>
        </div>
    )
}
export default Cadastro;