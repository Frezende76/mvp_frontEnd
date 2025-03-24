// Aguarda o carregamento completo do DOM antes de executar o Script.
//Isso garante que os elementos HTML estejam disponíveis

document.addEventListener("DOMContentLoaded", function() { 
    const form = document.getElementById("userform");
    const URL_API = "http://127.0.0.1:5000/usuarios";
    const userTable = document.getElementById("userTable");
    const btnConsultar = document.getElementById("btnConsultar");
    const inputNomeUsuario = document.getElementById("nome_usuario");

    // Função para verificar se o usuário com os mesmos dados já existe
    async function verificarUsuarioExistente(usuario) {
        return fetch(`${URL_API}/verificar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        })
        .then(response => response.json())
        .then(data => {
            if (data.usuarioExistente) {
                return true;  // Usuário já existe
            } else {
                return false;  // Nenhum usuário encontrado
            }
        })
        .catch(error => {
            console.error("Erro na requisição:", error);
            return false;
        });
    }
    // Evento de submit do formulário
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        // Criação do objeto usuario com os valores do formulário
        const usuario = {
            nome: document.getElementById("nome").value,
            endereco: document.getElementById("endereco").value,
            email: document.getElementById("email").value,
            telefone: document.getElementById("telefone").value
        };

        // Validação simples de campos vazios
        if (!usuario.nome || !usuario.endereco || !usuario.email || !usuario.telefone) {
            alert("Todos os campos são obrigatórios!");
            return;
        }

        // Verifica se o usuário já existe antes de enviar o cadastro
        verificarUsuarioExistente(usuario).then(usuarioExistente => {
            if (usuarioExistente) {
                alert("Usuário com os mesmos dados já está cadastrado.");
                return; // Não continua com o cadastro
            }

            // Envia os dados para o cadastro do novo usuário
            fetch(`${URL_API}/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuario)
            })
            .then(async response => {
                if (!response.ok) {
                    throw new Error("Erro ao cadastrar usuário");
                }
                return response.json();
            })
            .then(data => {
                alert("Usuário cadastrado com sucesso!");
                form.reset();
                atualizarTabela();
            })
            .catch(error => alert(error.message));
        });
    });

    function atualizarTabela() {
        fetch(`${URL_API}/todos`, {  // A URL foi alterada para a rota de busca de usuários
            method: "GET",  // Agora estamos fazendo um GET
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
            // Verificando se a resposta contém a chave de dados de usuários
            if (!data || !Array.isArray(data) || data.length === 0) {
                userTable.innerHTML = "<tr><td colspan='5' style='text-align: center; color: #fff'>Nenhum usuário encontrado.</td></tr>";
                return;
            }
            userTable.innerHTML = data.map(usuario => `
                <tr>
                    <td>${usuario.nome}</td>
                    <td>${usuario.endereco}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.telefone}</td>
                    <td>
                        <button onclick="editarUsuario(${usuario.id})">Editar</button>
                        <button onclick="deletarUsuario(${usuario.id})">Deletar</button>
                    </td>
                </tr>
            `).join("");
        })
        .catch(error => alert("Erro ao consultar usuários: " + error.message));
    }

    atualizarTabela();
});
 

    