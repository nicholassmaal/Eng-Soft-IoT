Há dois projetos nesse repositório:

1) Leaf Node
  Esse projeto já está inicialmente instalado dentro do Raspberry.
  O Leaf Node (ou 'nó folha') representa um equipamento ou dispositivo inteligente.

2) local-controller
  Esse projeto deve ser baixado em um PC (ou notebook) e faz o papel do controlador principal da casa conectada.


INSTRUÇÕES
=================================================================

REQUISITOS PARA COMPILAR E EXECUTAR OS PROJETOS

- Instalar o npm na máquina;

- Instalar o NodeJS na máquina;


PREPARAR O LOCAL-CONTROLLER (no PC)
-----------------------------
a) Acessar a pasta do projeto e executar:
  npm install rainfall
  npm install rainfall-tcp

b) Uma vez realizado o passo 'a' pela primeira vez, para executar, rodar o comando:
  nodejs controller.js


PREPARAR O LEAF-NODE (no Raspberry)
-----------------------------
a) Acessar a pasta do projeto e executar:
  npm install rainfall-tcp
  npm install rainfall-leaf

b) Uma vez realizado o passo 'a' pela primeira vez, para executar, rodar o comando:
  nodejs controller.js

