// ============================================
// AUTH.JS - Autenticação e Gerenciamento de Usuários
// ============================================

const Auth = {
    emailRecuperacao: null,
    codigoRecuperacao: null,

    verificarSessao: function() {
        const tokenSessao = sessionStorage.getItem('tokenBravado');
        if (tokenSessao) {
            try {
                const tokenData = JSON.parse(atob(tokenSessao));
                if (tokenData.expira > Date.now()) {
                    Bravado.state.usuarioAtual = Bravado.state.usuarios.find(u => u.id === tokenData.usuarioId);
                } else {
                    sessionStorage.removeItem('tokenBravado');
                }
            } catch (e) {
                sessionStorage.removeItem('tokenBravado');
            }
        }
    },

    atualizarInterfaceUsuario: function() {
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        
        if (Bravado.state.usuarioAtual) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            document.getElementById('user-name').textContent = Bravado.state.usuarioAtual.nome.split(' ')[0];
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    },

    // Modais
    abrirModalLogin: function() {
        document.getElementById('modal-login').classList.add('active');
    },

    fecharModalLogin: function() {
        document.getElementById('modal-login').classList.remove('active');
    },

    abrirModalCadastro: function() {
        this.fecharModalLogin();
        this.fecharModalRecuperarSenha();
        document.getElementById('modal-cadastro').classList.add('active');
    },

    fecharModalCadastro: function() {
        document.getElementById('modal-cadastro').classList.remove('active');
    },

    abrirModalRecuperarSenha: function() {
        this.fecharModalLogin();
        document.getElementById('modal-recuperar-senha').classList.add('active');
    },

    fecharModalRecuperarSenha: function() {
        document.getElementById('modal-recuperar-senha').classList.remove('active');
    },

    abrirModalVerificarCodigo: function() {
        this.fecharModalRecuperarSenha();
        document.getElementById('modal-verificar-codigo').classList.add('active');
    },

    fecharModalVerificarCodigo: function() {
        document.getElementById('modal-verificar-codigo').classList.remove('active');
    },

    abrirModalRedefinirSenha: function() {
        this.fecharModalVerificarCodigo();
        document.getElementById('modal-redefinir-senha').classList.add('active');
    },

    fecharModalRedefinirSenha: function() {
        document.getElementById('modal-redefinir-senha').classList.remove('active');
    },

    abrirModalTrocarSenha: function() {
        if (!Bravado.state.usuarioAtual) {
            Bravado.utils.mostrarMensagem('Faça login primeiro!', 'erro');
            return;
        }
        this.emailRecuperacao = Bravado.state.usuarioAtual.email;
        this.abrirModalRedefinirSenha();
    },

    // Ações
    fazerCadastro: async function(event) {
        event.preventDefault();
        Bravado.utils.mostrarLoading(true);
        
        try {
            const nome = document.getElementById('cadastro-nome').value;
            const email = document.getElementById('cadastro-email').value;
            const senha = document.getElementById('cadastro-senha').value;
            const confirmar = document.getElementById('cadastro-confirmar').value;
            
            if (senha !== confirmar) throw new Error('As senhas não coincidem!');
            if (senha.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres!');
            if (!/[A-Z]/.test(senha)) throw new Error('A senha deve ter uma letra maiúscula!');
            if (!/[0-9]/.test(senha)) throw new Error('A senha deve ter um número!');
            
            if (Bravado.state.usuarios.find(u => u.email === email)) {
                throw new Error('E-mail já cadastrado!');
            }
            
            const senhaHash = await Bravado.utils.hashSenha(senha);
            
            const novoUsuario = {
                id: Date.now(),
                nome,
                email,
                senhaHash,
                dataCadastro: new Date().toISOString(),
                pontosFidelidade: 0,
                historicoPedidos: []
            };
            
            Bravado.state.usuarios.push(novoUsuario);
            localStorage.setItem('usuariosBravado', JSON.stringify(Bravado.state.usuarios));
            
            Bravado.utils.mostrarMensagem('✅ Cadastro realizado! Faça login.', 'sucesso');
            this.fecharModalCadastro();
            this.abrirModalLogin();
            
        } catch (error) {
            Bravado.utils.mostrarMensagem(`❌ ${error.message}`, 'erro');
        } finally {
            Bravado.utils.mostrarLoading(false);
        }
    },

    fazerLogin: async function(event) {
        event.preventDefault();
        Bravado.utils.mostrarLoading(true);
        
        try {
            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;
            
            const senhaHash = await Bravado.utils.hashSenha(senha);
            const usuario = Bravado.state.usuarios.find(u => u.email === email && u.senhaHash === senhaHash);
            
            if (!usuario) throw new Error('E-mail ou senha incorretos!');
            
            const token = btoa(JSON.stringify({
                usuarioId: usuario.id,
                expira: Date.now() + 3600000
            }));
            
            sessionStorage.setItem('tokenBravado', token);
            Bravado.state.usuarioAtual = usuario;
            
            Bravado.utils.mostrarMensagem(`🍺 Bem-vindo, ${usuario.nome}!`, 'sucesso');
            this.fecharModalLogin();
            this.atualizarInterfaceUsuario();
            Bravado.navegacao.mostrarPagina('home');
            
        } catch (error) {
            Bravado.utils.mostrarMensagem(`❌ ${error.message}`, 'erro');
        } finally {
            Bravado.utils.mostrarLoading(false);
        }
    },

    logout: function() {
        sessionStorage.removeItem('tokenBravado');
        Bravado.state.usuarioAtual = null;
        Bravado.utils.mostrarMensagem('👢 Logout realizado!', 'sucesso');
        this.atualizarInterfaceUsuario();
        Bravado.navegacao.mostrarPagina('home');
    },

    enviarCodigoRecuperacao: async function(event) {
        event.preventDefault();
        Bravado.utils.mostrarLoading(true);
        
        try {
            const email = document.getElementById('recuperar-email').value;
            const usuario = Bravado.state.usuarios.find(u => u.email === email);
            
            if (!usuario) {
                throw new Error('E-mail não encontrado!');
            }
            
            this.codigoRecuperacao = Math.floor(100000 + Math.random() * 900000).toString();
            this.emailRecuperacao = email;
            
            console.log(`Código de recuperação para ${email}: ${this.codigoRecuperacao}`);
            
            Bravado.utils.mostrarMensagem(`📧 Código enviado para ${email}! (simulado: ${this.codigoRecuperacao})`, 'info');
            this.fecharModalRecuperarSenha();
            this.abrirModalVerificarCodigo();
            
        } catch (error) {
            Bravado.utils.mostrarMensagem(`❌ ${error.message}`, 'erro');
        } finally {
            Bravado.utils.mostrarLoading(false);
        }
    },

    verificarCodigo: function(event) {
        event.preventDefault();
        
        const codigo = document.getElementById('codigo-verificacao').value;
        
        if (codigo === this.codigoRecuperacao) {
            Bravado.utils.mostrarMensagem('✅ Código verificado!', 'sucesso');
            this.fecharModalVerificarCodigo();
            this.abrirModalRedefinirSenha();
        } else {
            Bravado.utils.mostrarMensagem('❌ Código inválido!', 'erro');
        }
    },

    reenviarCodigo: function() {
        if (!this.emailRecuperacao) return;
        
        this.codigoRecuperacao = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Novo código: ${this.codigoRecuperacao}`);
        Bravado.utils.mostrarMensagem(`📧 Novo código enviado! (${this.codigoRecuperacao})`, 'info');
    },

    redefinirSenha: async function(event) {
        event.preventDefault();
        Bravado.utils.mostrarLoading(true);
        
        try {
            const novaSenha = document.getElementById('nova-senha').value;
            const confirmarSenha = document.getElementById('confirmar-nova-senha').value;
            
            if (novaSenha !== confirmarSenha) {
                throw new Error('As senhas não coincidem!');
            }
            
            if (novaSenha.length < 8) {
                throw new Error('A senha deve ter pelo menos 8 caracteres!');
            }
            
            if (!/[A-Z]/.test(novaSenha)) {
                throw new Error('A senha deve ter uma letra maiúscula!');
            }
            
            if (!/[0-9]/.test(novaSenha)) {
                throw new Error('A senha deve ter um número!');
            }
            
            const usuarioIndex = Bravado.state.usuarios.findIndex(u => u.email === this.emailRecuperacao);
            if (usuarioIndex === -1) {
                throw new Error('Usuário não encontrado!');
            }
            
            const senhaHash = await Bravado.utils.hashSenha(novaSenha);
            Bravado.state.usuarios[usuarioIndex].senhaHash = senhaHash;
            
            localStorage.setItem('usuariosBravado', JSON.stringify(Bravado.state.usuarios));
            
            Bravado.utils.mostrarMensagem('✅ Senha redefinida com sucesso!', 'sucesso');
            this.fecharModalRedefinirSenha();
            
            if (!Bravado.state.usuarioAtual) {
                this.abrirModalLogin();
            }
            
        } catch (error) {
            Bravado.utils.mostrarMensagem(`❌ ${error.message}`, 'erro');
        } finally {
            Bravado.utils.mostrarLoading(false);
        }
    }
};

window.auth = Auth;