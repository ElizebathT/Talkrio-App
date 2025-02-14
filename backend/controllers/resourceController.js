const asyncHandler = require('express-async-handler');
const Resource = require('../models/resourcesModel');

const resourceController={
    getResources : asyncHandler(async (req, res) => {
    const resources = await Resource.find().populate("addedBy", "name email");
    res.send(resources);
    }),

    addResource : asyncHandler(async (req, res) => {
    const { title, description, category, link } = req.body;
    const resource = new Resource({
    title,
    description,
    category,
    link:req.file.path,
    addedBy: req.user.id, 
    });
    if(!resource){
        throw new Error("Error in creating resource")
    }
    await resource.save();
    res.send({ message: "Resource added successfully", resource });
    }),

    searchResources : asyncHandler(async (req, res) => {
        const { query } = req.body;
      
        if (!query) {
          throw new Error("Search query is required");
        }
      
        const resources = await Resource.find({
          $or: [
            { title: { $regex: query, $options: "i" } }, 
            { description: { $regex: query, $options: "i" } }, 
            { category: { $regex: query, $options: "i" } },
          ],
        }).populate("addedBy", "name email");
      if(!resources){
        res.send("No resoures found")
      }
        res.send(resources);
      }),

      deleteResource : asyncHandler(async (req, res) => {
        const {id}=req.body
        const resource = await Resource.findById(id);
      
        if (!resource) {
          res.status(404);
          throw new Error("Resource not found");
        }
      
        await resource.deleteOne();
        res.send("Resource deleted successfully");
      })
}
module.exports =resourceController;
