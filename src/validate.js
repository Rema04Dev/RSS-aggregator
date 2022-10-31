import * as yup from 'yup';

const isValidUrl = (url) => {
    const scheme = yup.string().required().url();
    try {
        return scheme.validateSync(url) ? true : false;
    } catch(err) {
        console.error(err);
    } 
}

export default isValidUrl;