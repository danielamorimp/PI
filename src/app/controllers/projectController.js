const express = require ('express');
const authMiddleware = require('../middlewares/auth');
const Project = require ('../models/Project');
const Task = require ('../models/Task');
const csv = require('csv-parser');
const fs = require('fs');
const db = require ('../../database/index');




const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res)=> {
    try{
        const projects = await Project.find().populate(['user', 'tasks']);

        return res.send({projects});
    }catch(err){
        return res.status(400).send({error: 'Erro ao listar máquinas'});

    }

});

router.get('/:projectId', async (req, res)=> {
    try{
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);

        return res.send({project});
    }catch(err){
        return res.status(400).send({error: 'Erro ao listar máquinas'});

    }

});

router.post('/', async (req, res)=> {
    try{

        const {title, description, tasks} = req.body;

        const project = await Project.create({title, description, user: req.userId});
      

        await Promise.all(tasks.map( async task =>{
            const projectTask = new Task({...task, project: project._Id});
            
            await projectTask.save();
            
            project.tasks.push(projectTask);     
        }));

        await project.save();

        return res.send({project});
    }catch(err){
        return res.status(400).send({error: 'Erro ao inserir maquinas'});

    }


});

router.put('/:projectId', async (req, res)=> {
    try{

        const {title, description, tasks} = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectId,{
            title, 
            description, 
        }, {new : true});


        project.tasks = [];
        await Task.remove({project : project._Id});
      

        await Promise.all(tasks.map( async task =>{
            const projectTask = new Task({...task, project: project._Id});
            
            await projectTask.save();
            
            project.tasks.push(projectTask);     
        }));

        await project.save();

        return res.send({project});
    }catch(err){
        return res.status(400).send({error: 'Erro ao atualizar maquinas'});

    }

});

router.delete('/:projectId', async (req, res)=> {
    try{
        await Project.findByIdAndRemove(req.params.projectId);

        return res.send();
    }catch(err){
        return res.status(400).send({error: 'Erro ao deletar máquina'});

    }
});
module.exports = app => app.use('/projects', router);

fs.createReadStream('./src/teste.csv')
    .pipe(csv())
    .on('data', (row) => {
        Project.create(row);
    })
    .on('end', () => {
        console.log('Máquinas cadastradas')
    });

    fs.createReadStream('./src/teste2.csv')
    .pipe(csv())
    .on('data', (row) => {
        Task.create(row);
    })
    .on('end', () => {
        console.log('Peças cadastradas')
    });
