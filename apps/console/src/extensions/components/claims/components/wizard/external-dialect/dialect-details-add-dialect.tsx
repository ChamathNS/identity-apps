/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { TestableComponentInterface } from "@wso2is/core/models";
import { Field, FormValue, Forms } from "@wso2is/forms";
import React, { FunctionComponent, ReactElement } from "react";
import { useTranslation } from "react-i18next";

/**
 * Prop types of `DialectDetails` component.
 */
interface DialectDetailsPropsInterface extends TestableComponentInterface {
    /**
     * Triggers submit.
     */
    submitState: boolean;
    /**
     * Called to initiate update.
     */
    onSubmit: (values: Map<string, FormValue>) => void;
    /**
     * Form Values to be saved.
     */
    values: Map<string, FormValue>;
}

/**
 * This renders the dialect details step of the add dialect wizard.
 *
 * @param {DialectDetailsPropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const DialectDetails: FunctionComponent<DialectDetailsPropsInterface> = (
    props: DialectDetailsPropsInterface
): ReactElement => {

    const {
        submitState,
        onSubmit,
        values,
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();

    return (
        <Forms
            onSubmit={
                (values: Map<string, FormValue>) => {
                    onSubmit(values);
                }
            }

            submitState={ submitState }
        >
            <Field
                type="text"
                name="dialectURI"
                label={ t("console:manage.features.claims.dialects.forms.dialectURI.label") }
                required={ true }
                requiredErrorMessage={ t("console:manage.features.claims.dialects." +
                    "forms.dialectURI.requiredErrorMessage") }
                placeholder={ t("console:manage.features.claims.dialects.forms.dialectURI.placeholder") }
                value={ values?.get("dialectURI")?.toString() }
                data-testid={ `${ testId }-form-dialect-uri-input` }
            />
        </Forms >
    );
};

/**
 * Default props for the application creation wizard.
 */
DialectDetails.defaultProps = {
    "data-testid": "dialect-details"
};