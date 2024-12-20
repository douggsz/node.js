// Importa o módulo fs para trabalhar com sistema de arquivos
import fs from "fs";

import { imageDescriptionGenerate, textResponse } from "../services/gemini.js";

// Importa funções para obter e criar posts
import { getPosts, createPost, updatePosts } from "../models/postModels.js";

// Função assíncrona para listar todos os posts
export async function index(req, res) {
  // Obtém todos os posts da base de dados
  const posts = await getPosts();
  // Envia os posts como resposta em formato JSON com status 200 (OK)
  res.status(200).json(posts);
}

// Função assíncrona para criar um novo post
export async function setPosts(req, res) {
  // Obtém os dados do post da requisição
  const post = req.body;
  try {
    // Cria um novo post na base de dados
    const newPost = await createPost(post);
    // Envia o novo post como resposta em formato JSON com status 200 (OK)
    res.status(200).json(newPost);
  } catch (error) {
    // Loga o erro no console
    console.error(error.message);
    // Envia uma mensagem de erro ao cliente com status 500 (Internal Server Error)
    res.status(500).json("Não foi possível criar o post");
  }
}

// Função assíncrona para fazer upload de uma imagem e criar um novo post
export async function uploadFiles(req, res) {
  // Cria um objeto com os dados do post, incluindo o nome do arquivo da imagem
  const post = {
    title: "",
    image: req.file.originalname,
    alt: "",
  };

  try {
    // Cria um novo post na base de dados
    const newPost = await createPost(post);
    // Cria o novo caminho para o arquivo da imagem, usando o ID do post
    const updateIMG = `uploads/${newPost.insertedId}.png`;
    // Renomeia o arquivo temporário para o novo caminho
    fs.renameSync(req.file.path, updateIMG);
    // Envia o novo post como resposta em formato JSON com status 200 (OK)
    res.status(200).json(newPost);
  } catch (error) {
    // Loga o erro no console
    console.error(error.message);
    // Envia uma mensagem de erro ao cliente com status 500 (Internal Server Error)
    res.status(500).json("Não foi possível criar o post");
  }
}

// Função assíncrona para criar um novo post
export async function updatePost(req, res) {
  // Obtém os dados do post da requisição
  const id = req.params.id;
  const image = `https://localhost:3000/uploads/${id}.png`;

  try {
    const imageBuffer = fs.readFileSync(`uploads/${id}.png`);
    const description = await imageDescriptionGenerate(imageBuffer);

    const post = {
      title: req.body.title,
      image: image,
      alt: description,
    };
    // Cria um novo post na base de dados
    const newPost = await updatePosts(id, post);
    // Envia o novo post como resposta em formato JSON com status 200 (OK)
    res.status(200).json(newPost);
  } catch (error) {
    // Loga o erro no console
    console.error(error.message);
    // Envia uma mensagem de erro ao cliente com status 500 (Internal Server Error)
    res.status(500).json("Não foi possível criar o post");
  }
}

export async function chatbotConversation(req, res) {

  const prompt = req.params.prompt;

  try {

    const newChat = await textResponse(prompt);

    res.status(200).json(newChat);

  } catch (error) {
    // Loga o erro no console
    console.error(error.message);
    // Envia uma mensagem de erro ao cliente com status 500 (Internal Server Error)
    res.status(500).json("Não foi possível obter resposta");
  }
}
