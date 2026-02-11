export default (sequelize, DataTypes) => {
  const Question = sequelize.define("Question", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    slug: {
      type: DataTypes.STRING(255),
      unique: true
    },

    description: {
      type: DataTypes.TEXT("long"),
      allowNull: false
    },

    difficulty: {
      type: DataTypes.STRING(20),
      defaultValue: "Easy"
    },

    examples: {
      type: DataTypes.JSON,
      defaultValue: []
    },

    constraints: {
      type: DataTypes.JSON,
      defaultValue: []
    },

    topics: {
      type: DataTypes.JSON,
      defaultValue: []
    }

  }, {
    tableName: "questions",
    timestamps: true
  });

  // auto slug
  Question.beforeCreate(q => {
    if (!q.slug) {
      q.slug = q.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
  });

  return Question;
};
