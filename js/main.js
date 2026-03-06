// ============================================
// MAIN.JS - Núcleo do Sistema Bravado
// ============================================

const Bravado = {
    // Estado global
    state: {
        usuarios: [],
        usuarioAtual: null,
        carrinho: [],
        produtos: [],
        opcoesSelecionadas: {}
    },

    // Utilitários
    utils: {
        mostrarMensagem: function(texto, tipo) {
            const mensagemArea = document.getElementById('mensagem-area');
            const mensagem = document.createElement('div');
            mensagem.className = `mensagem ${tipo}`;
            mensagem.textContent = texto;
            mensagemArea.appendChild(mensagem);
            setTimeout(() => mensagem.remove(), 3000);
        },

        mostrarLoading: function(show) {
            document.getElementById('loading').classList.toggle('active', show);
        },

        hashSenha: async function(senha) {
            const encoder = new TextEncoder();
            const data = encoder.encode(senha + 'bravado-salt-2024');
            const hash = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        },

        carregarHTML: async function(url) {
            try {
                const response = await fetch(url);
                return await response.text();
            } catch (error) {
                console.error('Erro ao carregar HTML:', error);
                return '';
            }
        },

        enviarMensagem: function(event) {
            event.preventDefault();
            this.mostrarMensagem('📧 Mensagem enviada! Em breve responderemos.', 'sucesso');
            event.target.reset();
        }
    },

    // Navegação
    navegacao: {
        mostrarPagina: async function(nomePagina) {
            try {
                const arquivo = `pages/${nomePagina}.html`;
                const conteudo = await Bravado.utils.carregarHTML(arquivo);
                
                document.getElementById('page-container').innerHTML = conteudo;
                
                // Inicializa componentes específicos da página
                if (nomePagina === 'products') {
                    window.products.renderizarCervejas();
                } else if (nomePagina === 'cart') {
                    window.cart.renderizarCarrinho();
                } else if (nomePagina === 'profile') {
                    window.profile.carregarPerfil();
                }
            } catch (error) {
                console.error('Erro ao carregar página:', error);
            }
        }
    },

    // Modais
    modais: {
        carregarModais: async function() {
            const modais = [
                'login',
                'cadastro',
                'recuperar-senha',
                'verificar-codigo',
                'redefinir-senha',
                'pagamento'
            ];

            for (const modal of modais) {
                const elemento = document.getElementById(`modal-${modal}`);
                if (elemento) {
                    const conteudo = await Bravado.utils.carregarHTML(`pages/modais/${modal}.html`);
                    elemento.innerHTML = conteudo;
                }
            }
        }
    },

    // Inicialização
    inicializar: async function() {
        console.log("🚀 Inicializando Bravado...");
        
        // 1. CHECAGEM DE SEGURANÇA
        const modulosNecessarios = [ 
            { nome: 'Auth', obj: window.auth },
            { nome: 'Cart', obj: window.cart }, 
            { nome: 'Profile', obj: window.profile }
        ]; 
        
        for (const modulo of modulosNecessarios) {
            if (!modulo.obj) { 
                console.error(`❌ ERRO: Módulo ${modulo.nome} não carregado`);
                this.utils.mostrarMensagem(`Erro ao carregar sistema: ${modulo.nome}`, 'erro');
                return;
            } 
        }
        
        // Carrega dados do localStorage
        this.state.usuarios = JSON.parse(localStorage.getItem('usuariosBravado')) || [];
        this.state.carrinho = JSON.parse(localStorage.getItem('carrinhoBravado')) || [];
        
        // Carrega modais
        await this.modais.carregarModais();
        
        // Verifica sessão
        if (window.auth.verificarSessao) {
            window.auth.verificarSessao();
        }
        
        // Atualiza interface
        if (window.auth.atualizarInterfaceUsuario) {
            window.auth.atualizarInterfaceUsuario();
        }
        
        if (window.cart.atualizarContador) {
            window.cart.atualizarContador();
        }
        
        // Carrega página inicial
        this.navegacao.mostrarPagina('home');
        
        // Carrega avaliação anterior
        const avaliacaoSalva = JSON.parse(localStorage.getItem('ultimaAvaliacao'));
        if (avaliacaoSalva && window.profile.avaliar) {
            window.profile.avaliar(avaliacaoSalva.nota);
        }
        
        // Mensagem de boas-vindas
        setTimeout(() => {
            this.utils.mostrarMensagem('🍺 Sistema Bravado pronto!', 'sucesso');
        }, 1000);
    }
};

// Exporta para uso global
window.Bravado = Bravado;
window.main = Bravado.navegacao;
