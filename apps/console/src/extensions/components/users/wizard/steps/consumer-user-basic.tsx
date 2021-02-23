/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { Field, FormValue, Forms, Validation } from "@wso2is/forms";
import { FormValidation } from "@wso2is/validation";
import React, { ReactElement, Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Grid,
    Message
} from "semantic-ui-react";
import { SharedUserStoreUtils } from "../../../../../features/core/utils";
import { getUsersList } from "../../../../../features/users";
import { USERSTORE_REGEX_PROPERTIES } from "../../../../../features/userstores";
import { UsersConstants } from "../../constants";

/**
 * import pass strength bat dynamically.
 */
const PasswordMeter = React.lazy(() => import("react-password-strength-bar"));

/**
 * Proptypes for the add consumer user basic component.
 */
export interface AddConsumerUserBasicProps {
    initialValues: any;
    triggerSubmit: boolean;
    emailVerificationEnabled: boolean;
    onSubmit: (values: any) => void;
    hiddenFields?: ("userName" | "firstName" | "lastName" | "password")[];
    requestedPasswordOption?: "askPw" | "createPw";
}

/**
 * Add consumer user basic component.
 *
 * TODO: Add localization support. (https://github.com/wso2-enterprise/asgardeo-product/issues/209)
 *
 * @return {ReactElement}
 */
export const AddConsumerUserBasic: React.FunctionComponent<AddConsumerUserBasicProps> = (
    props: AddConsumerUserBasicProps): ReactElement => {

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
    const confirmPasswordRef = useRef<HTMLDivElement>();
    const formBottomRef = useRef<HTMLDivElement>();
    const emailRef = useRef<HTMLDivElement>();

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
            domain: UsersConstants.CONSUMER_USERSTORE,
            email: values.get("email")?.toString(),
            firstName: values.get("firstName")?.toString(),
            lastName: values.get("lastName")?.toString(),
            newPassword: values.get("newPassword") && values.get("newPassword") !== undefined
                ? values.get("newPassword").toString()
                : "",
            passwordOption: values.get("passwordOption")?.toString()
        };
    };

    /**
     * Forcefully triggers the confirm password input field validation.
     */
    const triggerConfirmPasswordInputValidation = (): void => {

        const confirmInput = confirmPasswordRef?.
            current?.
            children[ 0 ]?.
            children[ 1 ]?.
            children[ 0 ] as HTMLInputElement;

        if (confirmInput && confirmInput.focus && confirmInput.blur) {
            confirmInput.focus();
            confirmInput.blur();
        }
    };


    /**
     * Scrolls to the first field that throws an error.
     *
     * @param {string} field The name of the field.
     */
    const scrollToInValidField = (field: string): void => {
        const options: ScrollIntoViewOptions = {
            behavior: "smooth",
            block: "center"
        };

        switch (field) {
            case "email":
                emailRef.current.scrollIntoView(options);
                break;
            case "formBottom":
                formBottomRef.current.scrollIntoView(options);
                break;
        }
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

                                    triggerConfirmPasswordInputValidation();

                                    const passwordRegex = await SharedUserStoreUtils.getUserStoreRegEx(
                                        UsersConstants.CONSUMER_USERSTORE,
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
                        {/*<Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>*/}
                        {/*    <Field*/}
                        {/*        className="generate-password-button"*/}
                        {/*        onClick={ generateRandomPassword }*/}
                        {/*        type="button"*/}
                        {/*        value={ t("common:generatePassword") }*/}
                        {/*        icon="random"*/}
                        {/*    />*/}
                        {/*</Grid.Column>*/}
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                            <Field
                                ref={ confirmPasswordRef }
                                listen = { () => { 
                                    scrollToInValidField("formBottom") 
                                } }
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
                                        scrollToInValidField("formBottom");
                                        return;
                                    }

                                    validation.isValid = true;
                                    validation.errorMessages.push(null);
                                    triggerConfirmPasswordInputValidation();
                                } }
                                tabIndex={ 6 }
                                enableReinitialize={ true }
                                maxWidth={ 60 }
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <div ref={ formBottomRef } />             
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

                triggerConfirmPasswordInputValidation();

                if (values.get("newPassword") !== values.get("confirmPassword")) {
                    return;
                }

                onSubmit(getFormValues(values));
            } }
            submitState={ triggerSubmit }
        >
            <Grid>
                {
                    !hiddenFields.includes("userName") && (
                        <Grid.Row>
                            <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                                <div  ref ={ emailRef } />
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
                                        try {
                                            if (value) {
                                                const usersList
                                                    = await getUsersList(null, null,
                                                    "userName eq " + value, null,
                                                    UsersConstants.CONSUMER_USERSTORE);

                                                if (usersList?.totalResults > 0) {
                                                    validation.isValid = false;
                                                    validation.errorMessages.push(USER_ALREADY_EXIST_ERROR_MESSAGE);
                                                }
                                            }
                                        } catch (error) {
                                            // Some non ascii characters are not accepted by DBs with certain charsets.
                                            // Hence, the API sends a `500` status code.
                                            // see https://github.com/wso2/product-is/issues/10190#issuecomment-719760318
                                            if (error?.response?.status === 500) {
                                                validation.isValid = false;
                                                validation.errorMessages.push(USERNAME_HAS_INVALID_CHARS_ERROR_MESSAGE);
                                            }
                                        }

                                        if (value && !SharedUserStoreUtils.validateInputAgainstRegEx(value,
                                            UsersConstants.USERNAME_JS_REGEX)) {
                                            validation.isValid = false;
                                            validation.errorMessages.push(USERNAME_REGEX_VIOLATION_ERROR_MESSAGE);
                                        }

                                        if (!FormValidation.email(value)) {
                                            validation.isValid = false;
                                            validation.errorMessages.push(
                                                t(
                                                    "console:manage.features.user.forms.addUserForm.inputs.email." +
                                                    "validations.invalid"
                                                ).toString()
                                            );
                                            scrollToInValidField("email");
                                        }
                                    }
                                    }
                                    type="email"
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

AddConsumerUserBasic.defaultProps = {
    hiddenFields: [],
    requestedPasswordOption: "askPw"
};