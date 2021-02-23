/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Field, FormValue, Forms, Validation } from "@wso2is/forms";
import { FormValidation } from "@wso2is/validation";
import React, { ReactElement, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Grid,
    Message
} from "semantic-ui-react";
import { SharedUserStoreUtils } from "../../../../features/core/utils";
import { getUsersList } from "../../../../features/users";
import { USERSTORE_REGEX_PROPERTIES } from "../../../../features/userstores";
import { ConsumerUsersConstants } from "../consumer-users-constants";

/**
 * import pass strength bat dynamically.
 */
const PasswordMeter = React.lazy(() => import("react-password-strength-bar"));

/**
 * Proptypes for the add consumer user component.
 */
export interface AddConsumerUserProps {
    initialValues: any;
    triggerSubmit: boolean;
    emailVerificationEnabled: boolean;
    onSubmit: (values: any) => void;
    hiddenFields?: ("userName" | "firstName" | "lastName" | "password")[];
    requestedPasswordOption?: "askPw" | "createPw";
}

/**
 * Add consumer user page.
 *
 * TODO: Add localization support. (https://github.com/wso2-enterprise/asgardeo-product/issues/209)
 *
 * @return {ReactElement}
 */
export const AddConsumerUser: React.FunctionComponent<AddConsumerUserProps> = (
    props: AddConsumerUserProps): ReactElement => {

    const {
        initialValues,
        triggerSubmit,
        emailVerificationEnabled,
        onSubmit,
        hiddenFields,
        requestedPasswordOption
    } = props;

    const [ passwordOption, setPasswordOption ] = useState(initialValues?.passwordOption);
    const [ password, setPassword ] = useState<string>("");
    const [ passwordScore, setPasswordScore ] = useState<number>(-1);

    const { t } = useTranslation();

    // Username input validation error messages.
    const USER_ALREADY_EXIST_ERROR_MESSAGE: string = t("console:manage.features.user.forms.addUserForm.inputs." +
        "username.validations.invalid");
    const USERNAME_REGEX_VIOLATION_ERROR_MESSAGE: string = t("console:manage.features.user.forms.addUserForm.inputs." +
        "username.validations.regExViolation");
    const USERNAME_HAS_INVALID_CHARS_ERROR_MESSAGE: string = t("console:manage.features.user.forms.addUserForm." +
        "inputs.username.validations.invalidCharacters");

    //TODO: Re-enable this after reviewing the usage of the generate password feature.
    // /**
    //  * The following useEffect is triggered when a random password is generated.
    //  */
    // useEffect(() => {
    //     if (randomPassword && randomPassword !== "") {
    //         setIsPasswordGenerated(true);
    //     }
    // }, [ randomPassword ]);

    /**
     * Set the password setup option to 'askPw'.
     */
    useEffect(() => {
        if (!passwordOption) {
            if (!requestedPasswordOption) {
                setPasswordOption("askPw");
                return;
            }

            setPasswordOption(requestedPasswordOption);
        }
    }, [ requestedPasswordOption ]);

    const passwordOptions = [
        {
            "data-testid": "user-mgt-add-user-form-ask-password-option-radio-button",
            label: t("console:manage.features.user.forms.addUserForm.buttons.radioButton.options.askPassword"),
            value: "askPw"
        },
        {
            "data-testid": "user-mgt-add-user-form-create-password-option-radio-button",
            label: t("console:manage.features.user.forms.addUserForm.buttons.radioButton.options.createPassword"),
            value: "createPw"
        }
    ];

    /**
     * The following function handles the change of the password.
     *
     * @param values
     */
    const handlePasswordChange = (values: Map<string, FormValue>): void => {
        const password: string = values.get("newPassword").toString();
        setPassword(password);
    };

    //TODO: Re-enable this after reviewing the usage of the generate password feature.
    // /**
    //  * The following function generate a random password.
    //  */
    // const generateRandomPassword = (): void => {
    //     const genPasswrod = generate({ length: 11, numbers: true, symbols: true, uppercase: true });
    //     setPassword(genPasswrod);
    //     setRandomPassword(genPasswrod);
    // };

    const getFormValues = (values: Map<string, FormValue>) => {
        return {
            confirmPassword: values.get("confirmPassword") && values.get("confirmPassword") !== undefined
                ? values.get("confirmPassword").toString()
                : "",
            domain: ConsumerUsersConstants.CONSUMER_USERSTORE,
            email: values.get("email")?.toString(),
            firstName: values.get("firstName")?.toString(),
            lastName: values.get("lastName")?.toString(),
            newPassword: values.get("newPassword") && values.get("newPassword") !== undefined
                ? values.get("newPassword").toString()
                : "",
            passwordOption: values.get("passwordOption")?.toString()
        };
    };

    const handlePasswordOptions = () => {
        if (passwordOption && passwordOption === "createPw") {
            return (
                <>
                    <Grid.Row columns={ 2 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                            <Field
                                data-testid="user-mgt-add-user-form-newPassword-input"
                                hidePassword={ t("common:hidePassword") }
                                label={ t(
                                    "console:manage.features.user.forms.addUserForm.inputs.newPassword.label"
                                ) }
                                name="newPassword"
                                placeholder={ t(
                                    "console:manage.features.user.forms.addUserForm.inputs." +
                                    "newPassword.placeholder"
                                ) }
                                required={ true }
                                requiredErrorMessage={ t(
                                    "console:manage.features.user.forms.addUserForm." +
                                    "inputs.newPassword.validations.empty"
                                ) }
                                showPassword={ t("common:showPassword") }
                                type="password"
                                value={ initialValues?.newPassword }
                                validation={ async (value: string, validation: Validation) => {
                                    const passwordRegex = await SharedUserStoreUtils.getUserStoreRegEx(
                                        ConsumerUsersConstants.CONSUMER_USERSTORE,
                                        USERSTORE_REGEX_PROPERTIES.PasswordRegEx);

                                    if(!SharedUserStoreUtils.validateInputAgainstRegEx(value, passwordRegex)){
                                        validation.isValid = false;
                                        validation.errorMessages.push( "Your password must contain at lease 8 " +
                                            "characters, one uppercase and lowercase letter, one digit and symbol" );
                                    }
                                } }
                                tabIndex={ 5 }
                                enableReinitialize={ true }
                                listen = { handlePasswordChange }
                                maxWidth={ 60 }
                            />
                            <Suspense fallback={ null } >
                                <PasswordMeter
                                    password={ password }
                                    onChangeScore={ (score: number) => {
                                        setPasswordScore(score);
                                    } }
                                    scoreWords={ [
                                        t("common:tooShort"),
                                        t("common:weak"),
                                        t("common:okay"),
                                        t("common:good"),
                                        t("common:strong")
                                    ] }
                                    shortScoreWord={ t("common:tooShort") }
                                />
                            </Suspense>
                        </Grid.Column>
                        { /*<Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>*/ }
                        { /*    <Field*/ }
                        { /*        className="generate-password-button"*/ }
                        { /*        onClick={ generateRandomPassword }*/ }
                        { /*        type="button"*/ }
                        { /*        value={ t("common:generatePassword") }*/ }
                        { /*        icon="random"*/ }
                        { /*    />*/ }
                        { /*</Grid.Column>*/ }
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                            <Field
                                data-testid="user-mgt-add-user-form-confirmPassword-input"
                                hidePassword={ t("common:hidePassword") }
                                label={ t(
                                    "console:manage.features.user.forms.addUserForm.inputs.confirmPassword.label"
                                ) }
                                name="confirmPassword"
                                placeholder={ t(
                                    "console:manage.features.user.forms.addUserForm.inputs." +
                                    "confirmPassword.placeholder"
                                ) }
                                required={ true }
                                requiredErrorMessage={ t(
                                    "console:manage.features.user.forms.addUserForm." +
                                    "inputs.confirmPassword.validations.empty"
                                ) }
                                showPassword={ t("common:showPassword") }
                                type="password"
                                value={ initialValues?.confirmPassword }
                                validation={ (value: string, validation: Validation, formValues) => {
                                    if (formValues.get("newPassword") !== value) {
                                        validation.isValid = false;
                                        validation.errorMessages.push(
                                            t("console:manage.features.user.forms.addUserForm.inputs" +
                                                ".confirmPassword.validations.mismatch"));
                                    }
                                } }
                                tabIndex={ 6 }
                                enableReinitialize={ true }
                                maxWidth={ 60 }
                            />
                        </Grid.Column>
                    </Grid.Row>
                </>
            );
        } else if (passwordOption && passwordOption === "askPw") {
            return (
                <>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                            <Message
                                icon="mail"
                                content="An email with a confirmation link will be sent to the provided email address
                                for the user to set their own password."
                            />
                        </Grid.Column>
                    </Grid.Row>
                </>
            );
        } else {
            return "";
        }
    };

    /**
     * The modal to add new user.
     */
    const addUserBasicForm = () => (
        <Forms
            data-testid="user-mgt-add-user-form"
            onSubmit={ (values) => {
                onSubmit(getFormValues(values));
            } }
            submitState={ triggerSubmit }
        >
            <Grid>
                {
                    !hiddenFields.includes("userName") && (
                        <Grid.Row>
                            <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                                <Field
                                    data-testid="user-mgt-add-user-form-email-input"
                                    label={ "Email (username)" }
                                    name="email"
                                    placeholder={ t(
                                        "console:manage.features.user.forms.addUserForm.inputs." +
                                        "email.placeholder"
                                    ) }
                                    required={ true }
                                    requiredErrorMessage={ t(
                                        "console:manage.features.user.forms.addUserForm.inputs.email.validations.empty"
                                    ) }
                                    validation={ async (value: string, validation: Validation) => {
                                        if (value) {
                                            if (!FormValidation.email(value)) {
                                                validation.isValid = false;
                                                validation.errorMessages.push(
                                                    t("console:manage.features.user.forms.addUserForm.inputs." +
                                                        "email.validations.invalid"
                                                    ).toString()
                                                );
                                            } else if (value && !SharedUserStoreUtils.validateInputAgainstRegEx(value,
                                                ConsumerUsersConstants.USERNAME_JS_REGEX)) {
                                                validation.isValid = false;
                                                validation.errorMessages.push(USERNAME_REGEX_VIOLATION_ERROR_MESSAGE);
                                            } else {
                                                try {
                                                    const usersList = await getUsersList(null, null,
                                                        "userName eq " + value, null,
                                                        ConsumerUsersConstants.CONSUMER_USERSTORE);

                                                    if (usersList?.totalResults > 0) {
                                                        validation.isValid = false;
                                                        validation.errorMessages.push(USER_ALREADY_EXIST_ERROR_MESSAGE);
                                                    }
                                                } catch (error) {
                                                    // Some non ascii characters are not accepted by DBs with certain
                                                    // charsets. Hence, the API sends a `500` status code.
                                                    // see https://github.com/wso2/product-is/issues/
                                                    // 10190#issuecomment-719760318
                                                    if (error?.response?.status === 500) {
                                                        validation.isValid = false;
                                                        validation.errorMessages.push(
                                                            USERNAME_HAS_INVALID_CHARS_ERROR_MESSAGE);
                                                    }
                                                }
                                            }
                                        }
                                    } }
                                    type="email"
                                    displayErrorOn="blur"
                                    value={ initialValues && initialValues.email }
                                    tabIndex={ 1 }
                                    maxLength={ 60 }
                                />
                            </Grid.Column>
                        </Grid.Row>
                    )
                }
                {
                    !hiddenFields.includes("firstName") && (
                        <Grid.Row>
                            <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                                <Field
                                    data-testid="user-mgt-add-user-form-firstName-input"
                                    label={ t(
                                        "console:manage.features.user.forms.addUserForm.inputs.firstName.label"
                                    ) }
                                    name="firstName"
                                    placeholder={ t(
                                        "console:manage.features.user.forms.addUserForm.inputs." +
                                        "firstName.placeholder"
                                    ) }
                                    required={ false }
                                    requiredErrorMessage={ t(
                                        "console:manage.features.user.forms.addUserForm." +
                                        "inputs.firstName.validations.empty"
                                    ) }
                                    type="text"
                                    value={ initialValues && initialValues.firstName }
                                    tabIndex={ 2 }
                                    maxLength={ 30 }
                                />
                            </Grid.Column>
                        </Grid.Row>
                    )
                }
                {
                    !hiddenFields.includes("lastName") && (
                        <Grid.Row>
                            <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                                <Field
                                    data-testid="user-mgt-add-user-form-lastName-input"
                                    label={ t(
                                        "console:manage.features.user.forms.addUserForm.inputs.lastName.label"
                                    ) }
                                    name="lastName"
                                    placeholder={ t(
                                        "console:manage.features.user.forms.addUserForm.inputs." +
                                        "lastName.placeholder"
                                    ) }
                                    required={ false }
                                    requiredErrorMessage={ t(
                                        "console:manage.features.user.forms.addUserForm." +
                                        "inputs.lastName.validations.empty"
                                    ) }
                                    type="text"
                                    value={ initialValues && initialValues.lastName }
                                    tabIndex={ 3 }
                                    maxLength={ 30 }
                                />
                            </Grid.Column>
                        </Grid.Row>
                    )
                }
                { emailVerificationEnabled && (
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                            <Field
                                type="radio"
                                label={ t("console:manage.features.user.forms.addUserForm.buttons.radioButton.label") }
                                name="passwordOption"
                                default="askPw"
                                listen={ (values) => { setPasswordOption(values.get("passwordOption").toString()); } }
                                children={ passwordOptions }
                                value={ initialValues?.passwordOption ? initialValues?.passwordOption : "askPw" }
                                tabIndex={ 4 }
                                maxWidth={ 60 }
                                width={ 60 }
                            />
                        </Grid.Column>
                    </Grid.Row>
                ) }
                { !hiddenFields.includes("password") && handlePasswordOptions() }
            </Grid>
        </Forms>
    );

    return (
        <>
            { addUserBasicForm() }
        </>
    );
};

AddConsumerUser.defaultProps = {
    hiddenFields: [],
    requestedPasswordOption: "askPw"
};