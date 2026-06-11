import axios from "axios";
export const getErrorMessage = (error, fallback) => {
    if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        const fieldErrors = Object.entries(responseData?.errors?.fieldErrors ?? {})
            .flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`))
            .filter(Boolean);
        const formErrors = responseData?.errors?.formErrors?.filter(Boolean) ?? [];
        const detailMessage = [...formErrors, ...fieldErrors][0];
        if (responseData?.message && detailMessage) {
            return `${responseData.message}: ${detailMessage}`;
        }
        return String(responseData?.message ?? detailMessage ?? error.message ?? fallback);
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
};
