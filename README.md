Há dois projetos nesse repositório:

1) Leaf Node

  Esse projeto já está inicialmente instalado dentro do Raspberry.
  O Leaf Node (ou 'nó folha') representa um equipamento ou dispositivo inteligente.

2) local-controller

  Esse projeto deve ser baixado em um PC (ou notebook) e faz o papel do controlador principal da casa conectada.


INSTRUÇÕES
=================================================================

REQUISITOS PARA COMPILAR E EXECUTAR OS PROJETOS

- Instalar o NodeJS na máquina - https://nodejs.org/en/download/


PREPARAR O LOCAL-CONTROLLER (no PC)
-----------------------------------
- Acessar a pasta do projeto e executar:

  npm install rainfall

  npm install rainfall-tcp

- Uma vez realizado o passo anterior pela primeira vez, para executar, rodar o comando:

  nodejs controller.js


PREPARAR O LEAF-NODE (no Raspberry)
------------------------------------
- Acessar a pasta do projeto e executar:

  npm install rainfall-tcp

  npm install rainfall-leaf

- Uma vez realizado o passo anterior pela primeira vez, para executar, rodar o comando:

  nodejs controller.js

