'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class valid_question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  valid_question.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    SUBCODE: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
        Dep_Name: {
      type: DataTypes.STRING(15),
      allowNull: false
    },

    SUBCODE_RAW: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null
    },
    SECTION: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    },
    FROM_QST: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    TO_QST: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    MARK_MAX: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    NOQST: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    SUB_SEC: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    },
    Eva_Mon_Year: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    C_QST: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'valid_question',
    tableName: 'valid_questions',
    timestamps: true
  });
  return valid_question;
};
