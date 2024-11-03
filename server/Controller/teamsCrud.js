const path = require("path");
const fs = require("fs");
const Teams = require("../Model/teams");

// Function to add a new team
// const addTeam = async (teamData, teamImg, io) => {
//   try {
//     // Create a new instance of the Teams model with the provided data
//     const newteam = new Teams({
//       name: teamData.name,
//       ranking: teamData.ranking,
//       score: teamData.score,
//       program: teamData.program,
//       isSingle: teamData.isSingle,
//       isGroup: teamData.isGroup,
//       type: teamData.type,
//       image: teamImg ? teamImg.filename : null,
//     });

//     // Save the new team to the database
//     const savedteam = await newteam.save();
//     io.emit("team_add");

//     return savedteam;
//   } catch (error) {
//     throw error;
//   }
// };

const addTeam = async (name, image) => {
  try {
    // Create a new team
    const newTeam = new Teams({
      name,
      image,
      programs: [], // Empty program array initially
    });

    await newTeam.save();
    return newTeam;
  } catch (error) {
    throw error;
  }
};

// const getAllTeams = async () => {
//   try {
//     // Fetch all Teams from the database
//     const allTeams = await Teams.find();

//     return allTeams;
//   } catch (error) {
//     throw error;
//   }
// };

const getAllTeams = async () => {
  try {
    const teams = await Teams.find().sort({ totalScore: -1 }); // Sort teams by totalScore in descending order

    return teams;
  } catch (error) {
    throw error;
  }
};

const getTeamById = async (id) => {
  try {
    // Find team by ID in the database and populate programs field with details from the Program model
    const team = await Teams.findById(id).populate({
      path: "programs.programId", // Populate programId inside the programs array
      select: "label value", // Select specific fields from the Program model
    });

    if (!team) {
      throw new Error("Team not found");
    }

    return team;
  } catch (error) {
    throw error;
  }
};

const getTeamByCategory = async (category) => {
  try {
    // Find team by ID in the database
    const team = await Teams.findById(category);
    if (!team) {
      throw new Error("team not found");
    }
    return team;
  } catch (error) {
    throw error;
  }
};

const updateTeamById = async (id, newData, newImage, io) => {
  try {
    // Find team by ID and update its data in the database
    const currentData = await Teams.findById(id);

    if (!currentData) {
      throw new Error("team not found");
    }

    currentData.name = newData.name;
   

    if (newImage) {
      // Delete the old image file from the folder
      if (currentData.image) {
        const imagePath = path.join(
          __dirname,
          "../public/teamImages",
          currentData.image
        );

        fs.unlinkSync(imagePath);
      }

      currentData.image = newImage.filename;
    }

    await currentData.save();
    io.emit("team_update");

    return currentData;
  } catch (error) {
    throw error;
  }
};

const deleteTeamById = async (id, io) => {
  try {
    // Find team by ID and delete it from the database
    const deletedteam = await Teams.findByIdAndDelete(id);
    if (!deletedteam) {
      throw new Error("team not found");
    }

    // Retrieve the filename of the image associated with the franchise
    const imageUrl = deletedteam.image;

    // Delete the image file from the folder
    if (imageUrl) {
      const imagePath = path.join(__dirname, "../public/teamImages", imageUrl);
      fs.unlinkSync(imagePath);
    }

    io.emit("team_delete");
    return deletedteam;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addTeam,
  getAllTeams,
  deleteTeamById,
  updateTeamById,
  getTeamById,
  getTeamByCategory,
};