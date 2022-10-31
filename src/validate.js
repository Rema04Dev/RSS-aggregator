import * as yup from 'yup';

const isValidUrl = (url) => {
    const scheme = yup.string().required().url();
    return scheme.validateSync(url) ? true : false;
}

export default isValidUrl;