/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

export const SDKMeta = {
    angular: {
        npmInstallCommand: "npm install @asgardeo/auth-angular --save",
        readme: "https://github.com/asgardeo/asgardeo-auth-angular-sdk/blob/main/README.md",
        repository: "https://github.com/asgardeo/asgardeo-auth-angular-sdk",
        samples: {
            basicUsage: {
                artifact:
                    "https://github.com/asgardeo/asgardeo-auth-angular-sdk/releases/download/v0.1.2/" +
                    "asgardeo-angular-app.zip",
                repository:
                    "https://github.com/asgardeo/asgardeo-auth-angular-sdk/tree/main/samples/asgardeo-angular-app"
            },
            root: "https://github.com/asgardeo/asgardeo-auth-angular-sdk/tree/main/samples"
        }
    },
    javascript: {
        apis: "https://github.com/asgardeo/asgardeo-auth-spa-sdk/blob/main/README.md#apis",
        artifact: "",
        cdn: "https://unpkg.com/@asgardeo/auth-spa@latest/dist/asgardeo-spa.production.min.js",
        npmInstallCommand: "npm install @asgardeo/auth-spa --save",
        readme: "https://github.com/asgardeo/asgardeo-auth-spa-sdk/blob/main/README.md",
        repository: "https://github.com/asgardeo/asgardeo-auth-spa-sdk",
        samples: {
            javascript: {
                artifact:
                    "https://github.com/asgardeo/asgardeo-auth-spa-sdk/releases/download/v0.1.2/" +
                    "asgardeo-html-js-app.zip",
                repository: "https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/main/samples/asgardeo-html-js-app"
            },
            react: {
                artifact:
                    "https://github.com/asgardeo/asgardeo-auth-spa-sdk/releases/download/v0.1.2/" +
                    "asgardeo-react-js-app.zip",
                repository: "https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/main/samples/asgardeo-react-js-app"
            },
            root: "https://github.com/asgardeo/asgardeo-auth-spa-sdk/tree/main/samples"
        }
    },
    react: {
        npmInstallCommand: "npm install @asgardeo/auth-react react-router-dom --save",
        readme: "https://github.com/asgardeo/asgardeo-auth-react-sdk/blob/main/README.md",
        repository: "https://github.com/asgardeo/asgardeo-auth-react-sdk",
        samples: {
            basicUsage: {
                artifact:
                    "https://github.com/asgardeo/asgardeo-auth-react-sdk/releases/download/v0.1.1/" +
                    "asgardeo-react-app.zip",
                repository:
                    "https://github.com/asgardeo/asgardeo-auth-react-sdk/tree/main/samples/asgardeo-react-app"
            },
            root: "https://github.com/asgardeo/asgardeo-auth-react-sdk/tree/main/samples"
        }
    }
};