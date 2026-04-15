"use strict";
const { Model } = require("sequelize");
const AppError = require("../../utils/appError");

module.exports = (sequelize, DataTypes) => {
  const navbar_header = sequelize.define(
    "navbar_header",
    {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    Nav_Main_Header_Name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Navigation main header name is required",
        },
        notEmpty: {
          msg: "Navigation main header name is required",
        },
        len: {
          args: [2, 100],
          msg: "Navigation main header name must be between 2 and 100 characters",
        },
      },
    },
    Nav_Main_Header_Name_Description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: "Description must not exceed 1000 characters",
        },
      },
    },
    Nav_Header_1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Nav Header 1 is required",
        },
        isInt: {
          msg: "Nav Header 1 must be an integer",
        },
        min: {
          args: [0],
          msg: "Nav Header 1 must be a positive number",
        },
      },
    },
    Nav_Header_2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Nav Header 2 is required",
        },
        isInt: {
          msg: "Nav Header 2 must be an integer",
        },
        min: {
          args: [0],
          msg: "Nav Header 2 must be a positive number",
        },
      },
    },
    Nav_Header_3: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Nav Header 3 is required",
        },
        isInt: {
          msg: "Nav Header 3 must be an integer",
        },
        min: {
          args: [0],
          msg: "Nav Header 3 must be a positive number",
        },
      },
    },
    Nav_Header_4:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Nav Header 4 is required",
        },
        isInt: {
          msg: "Nav Header 4 must be an integer",
        },
        min: {
          args: [0],
          msg: "Nav Header 4 must be a positive number",
        },
      },
    },
    user_Type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notNull: {
          msg: "User type is required",
        },
        isInt: {
          msg: "User type must be an integer",
        },
        min: {
          args: [0],
          msg: "User type must be 0 or greater",
        },
      },
    },
    user_Role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "User role is required",
        },
        isInt: {
          msg: "User role must be an integer",
        },
        min: {
          args: [0],
          msg: "User role must be a positive number",
        },
      },
    },
    Nav_Status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notNull: {
          msg: "Navigation status is required",
        },
        isInt: {
          msg: "Navigation status must be an integer",
        },
        isIn: {
          args: [[0, 1, 2]],
          msg: "Status must be 0 (disabled), 1 (active), or 2 (inactive)",
        },
      },
    },
    // display_order: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   defaultValue: 0,
    //   validate: {
    //     isInt: {
    //       msg: "Display order must be an integer",
    //     },
    //     min: {
    //       args: [0],
    //       msg: "Display order must be a positive number",
    //     },
    //   },
    // },
    // icon_class: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    //   validate: {
    //     len: {
    //       args: [0, 50],
    //       msg: "Icon class must not exceed 50 characters",
    //     },
    //   },
    // },
    Nav_Icons: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Description must not exceed 500 characters",
        },
      },
    },
    route_path: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: "Route path must not exceed 200 characters",
        },
      },
    },
    // permission_level: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   defaultValue: 1,
    //   validate: {
    //     notNull: {
    //       msg: "Permission level is required",
    //     },
    //     isInt: {
    //       msg: "Permission level must be an integer",
    //     },
    //     min: {
    //       args: [1],
    //       msg: "Permission level must be at least 1",
    //     },
    //     max: {
    //       args: [10],
    //       msg: "Permission level must not exceed 10",
    //     },
    //   },
    // },
    // is_visible: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: false,
    //   defaultValue: true,
    //   validate: {
    //     notNull: {
    //       msg: "Visibility status is required",
    //     },
    //   },
    // },
    // created_by: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: "user",
    //     key: "id",
    //   },
    //   validate: {
    //     isInt: {
    //       msg: "Created by must be a valid user ID",
    //     },
    //   },
    // },
    // updated_by: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: "user",
    //     key: "id",
    //   },
    //   validate: {
    //     isInt: {
    //       msg: "Updated by must be a valid user ID",
    //     },
    //   },
    // },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // deletedAt: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    // },
  },
  {
    // paranoid: true, // Enable soft deletes
    freezeTableName: true,
    modelName: "Navbar_headers",
    tableName: "Navbar_headers",
    // timestamps: true,
    // indexes: [
    //   {
    //     fields: ["Nav_Status"],
    //   },
    //   {
    //     fields: ["user_Type"],
    //   },
    //   {
    //     fields: ["user_Role"],
    //   },
    //   {
    //     fields: ["display_order"],
    //   },
    //   {
    //     fields: ["is_visible"],
    //   },
    //   {
    //     unique: true,
    //     fields: ["Nav_Main_Header_Name", "user_Type", "user_Role"],
    //     name: "unique_nav_header_per_user_type_role",
    //   },
    // ],
    // hooks: {
    //   beforeCreate: (navHeader, options) => {
    //     // Auto-generate display order if not provided
    //     if (!navHeader.display_order) {
    //       navHeader.display_order = Date.now();
    //     }

    //     // Validate nav header hierarchy
    //     if (navHeader.Nav_Header_2 > 0 && navHeader.Nav_Header_1 === 0) {
    //       throw new AppError(
    //         "Nav_Header_1 must be set when Nav_Header_2 is provided",
    //         400
    //       );
    //     }

    //     if (navHeader.Nav_Header_3 > 0 && navHeader.Nav_Header_2 === 0) {
    //       throw new AppError(
    //         "Nav_Header_2 must be set when Nav_Header_3 is provided",
    //         400
    //       );
    //     }
    //   },
    //   beforeUpdate: (navHeader, options) => {
    //     // Update the updatedAt timestamp
    //     navHeader.updatedAt = new Date();

    //     // Validate nav header hierarchy on update
    //     if (navHeader.Nav_Header_2 > 0 && navHeader.Nav_Header_1 === 0) {
    //       throw new AppError(
    //         "Nav_Header_1 must be set when Nav_Header_2 is provided",
    //         400
    //       );
    //     }

    //     if (navHeader.Nav_Header_3 > 0 && navHeader.Nav_Header_2 === 0) {
    //       throw new AppError(
    //         "Nav_Header_2 must be set when Nav_Header_3 is provided",
    //         400
    //       );
    //     }
    //   },
    // },
    // Define associations
    // associate: function (models) {
    //   // Association with user model
    //   this.belongsTo(models.user, {
    //     foreignKey: "created_by",
    //     as: "creator",
    //   });

    //   this.belongsTo(models.user, {
    //     foreignKey: "updated_by",
    //     as: "updater",
    //   });

    //   // Self-referencing associations for hierarchical structure
    //   this.hasMany(models.navbar_header, {
    //     foreignKey: "Nav_Header_1",
    //     as: "subHeaders1",
    //   });

    //   this.hasMany(models.navbar_header, {
    //     foreignKey: "Nav_Header_2",
    //     as: "subHeaders2",
    //   });

    //   this.belongsTo(models.navbar_header, {
    //     foreignKey: "Nav_Header_1",
    //     as: "parentHeader1",
    //   });

    //   this.belongsTo(models.navbar_header, {
    //     foreignKey: "Nav_Header_2",
    //     as: "parentHeader2",
    //   });
    // },
    // Instance methods
    // toJSON: function () {
    //   const values = { ...this.get() };

    //   // Remove sensitive or unnecessary fields from JSON output
    //   delete values.deletedAt;

    //   return values;
    // },
  }
);

  return navbar_header;
};
