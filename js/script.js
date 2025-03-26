// Aguarda o carregamento completo do DOM antes de executar o Script.
//Isso garante que os elementos HTML estejam disponíveis

document.addEventListener("DOMContentLoaded", function() { 
    const form = document.getElementById("userform");
    const URL_API = "http://127.0.0.1:5000/usuarios";
    const userTable = document.getElementById("userTable");
    const inputNomeUsuario = document.getElementById("nome_usuario");

    async function verificarUsuarioExistente(usuario) {
        return fetch(`${URL_API}/verificar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        })
        .then(response => response.json())
        .then(data => data.usuarioExistente)
        .catch(error => {
            console.error("Erro na requisição:", error);
            return false;
        });
    }

    async function buscarUsuario(id) {
        return fetch(`${URL_API}/buscar/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .catch(error => {
            console.error("Erro ao buscar usuário:", error);
            return null;
        });
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const usuario = {
            nome: document.getElementById("nome").value.trim(),
            endereco: document.getElementById("endereco").value.trim(),
            email: document.getElementById("email").value.trim(),
            telefone: document.getElementById("telefone").value.trim()
        };

        if (!usuario.nome || !usuario.endereco || !usuario.email || !usuario.telefone) {
            alert("Todos os campos são obrigatórios!");
            return;
        }

        verificarUsuarioExistente(usuario).then(usuarioExistente => {
            if (usuarioExistente) {
                alert("Usuário com os mesmos dados já está cadastrado.");
                return;
            }

            fetch(`${URL_API}/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuario)
            })
            .then(response => {
                if (!response.ok) throw new Error("Erro ao cadastrar usuário");
                return response.json();
            })
            .then(() => {
                alert("Usuário cadastrado com sucesso!");
                form.reset();
                atualizarTabela();
            })
            .catch(error => alert(error.message));
        });
    });

    async function atualizarTabela(nome = "") {
        let url = `${URL_API}/todos`;
        if (nome.trim() !== "") {
            url += `?nome=${encodeURIComponent(nome)}`;
        }

        fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
        .then(response => response.json())
        .then(data => {
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

    async function editarUsuario(id) {
        const usuario = await buscarUsuario(id);
        if (!usuario) {
            alert("Usuário não encontrado");
            return;
        }

        const usuarioNome = prompt("Digite o novo nome:", usuario.nome).trim();
        const usuarioEndereco = prompt("Digite o novo endereço:", usuario.endereco).trim();
        const usuarioEmail = prompt("Digite o novo e-mail:", usuario.email).trim();
        const usuarioTelefone = prompt("Digite o novo telefone:", usuario.telefone).trim();

        if (!usuarioNome || !usuarioEndereco || !usuarioEmail || !usuarioTelefone) {
            alert("Todos os campos são obrigatórios para editar o usuário!");
            return;
        }

        const usuarioEditado = { nome: usuarioNome, endereco: usuarioEndereco, email: usuarioEmail, telefone: usuarioTelefone };

        fetch(`${URL_API}/editar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuarioEditado)
        })
        .then(response => response.json())
        .then(() => {
            alert("Usuário editado com sucesso!");
            atualizarTabela();
        })
        .catch(error => alert("Erro ao editar o usuário: " + error.message));
    }

    async function deletarUsuario(id) {
        if (confirm("Tem certeza que deseja deletar esse usuário?")) {
            fetch(`${URL_API}/deletar/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            })
            .then(response => response.json())
            .then(() => {
                alert("Usuário deletado com sucesso!");
                atualizarTabela();
            })
            .catch(error => alert("Erro ao deletar o usuário: " + error.message));
        }
    }

    window.editarUsuario = editarUsuario;
    window.deletarUsuario = deletarUsuario;

    inputNomeUsuario.addEventListener("input", function() {
        const nome = inputNomeUsuario.value.trim();
    
        // Atualiza a URL sem recarregar a página
        const newUrl = nome ? `?nome=${encodeURIComponent(nome)}` : window.location.pathname;
        window.history.pushState({}, "", newUrl);

        // Chama a função para atualizar a tabela
        atualizarTabela(nome);
    });

    // Captura o nome da URL ao carregar a página e faz a busca automática
    const params = new URLSearchParams(window.location.search);
    const nomeBuscado = params.get("nome") || "";
    if (nomeBuscado) {
        inputNomeUsuario.value = nomeBuscado;
        atualizarTabela(nomeBuscado);
    }
});

    