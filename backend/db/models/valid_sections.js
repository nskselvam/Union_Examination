"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class valid_sections extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  valid_sections.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sub_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      Dep_Name: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      subcode_raw: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      qstn_num: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_mark: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      valid_qstn: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      section: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      sub_section: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      add_sub_section: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      // created_on: {
      //   type: DataTypes.STRING(50),
      //   allowNull: true,
      // },
      // updated_on: {
      //   type: DataTypes.STRING(50),
      //   allowNull: true,
      // },
      Eva_Mon_Year: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      BL_Point: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      CO_Point: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      PO_Point: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "valid_sections",
      tableName: "valid_sections",
      timestamps: true,
      indexes: [
        { fields: ["sub_code"] },
        { fields: ["qstn_num"] },
        { fields: ["section"] },
        { fields: ["sub_section"] },
        { fields: ["add_sub_section"] },
      ],
    }
  );

  return valid_sections;
};
