"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const task_names_1 = require("../task-names");
const builder_1 = require("@usecannon/builder");
(0, config_1.task)(task_names_1.TASK_STATUS, 'Display the status of the cannon package')
    .addOptionalParam('chartsDirectory', 'Directory for cannon charts')
    .setAction(({ chartsDirectory }, hre) => __awaiter(void 0, void 0, void 0, function* () {
    const directory = chartsDirectory || (0, builder_1.getSavedChartsDir)();
    const deployInfo = yield (0, builder_1.getAllDeploymentInfos)(directory);
    console.log(deployInfo);
}));
