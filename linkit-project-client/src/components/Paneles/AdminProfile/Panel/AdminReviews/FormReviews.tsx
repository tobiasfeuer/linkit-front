
import { useState } from "react";
import axios from "axios";
import swal from 'sweetalert';
import { validations } from "./Validation";
import { ValidationError } from "../../../errors/errors";
import { validateReview } from "../../../errors/validation";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { IUser } from "../../../../Profiles/types";
import { ReviewProps } from "../../../admin.types";


type OnCloseFunction = () => void;

interface FormReviewProps {
    onClose: OnCloseFunction;
    setSaveStatus: (status: boolean) => void;
}

export type stateProps = {
    Authentication: {
        user: IUser
    }
}

export default function FormReview({ onClose, setSaveStatus }: FormReviewProps) {

    const { t } = useTranslation();
    const token = useSelector((state: stateProps) => state.Authentication.user._id)
    const user = useSelector((state: stateProps) => state.Authentication.user)

    const [information, setInformation] = useState<Partial<ReviewProps>>({
        name: "",
        country: "",
        detail: "",
        createdBy: user.firstName.concat(user.lastName),
    });

    const [errors, setErrors] = useState({
        name: "",
        country: "",
        detail: "",
    });




    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setInformation({
            ...information,
            [name]: value,
        });

        const validationError = validations(information as ReviewProps);
        setErrors(validationError);
    };


    const handleBlurErrors = () => {
        const validationError = validations(information as ReviewProps);
        setErrors(validationError);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationError = validations(information as ReviewProps);
        setErrors(validationError);
        try {
            //* validation review form
            const validationError = validations(information as ReviewProps)
            setErrors(validationError)

            validateReview(information as ReviewProps) //* errors from console
            const endPoint = `${import.meta.env.VITE_ENDPOINT_URL}/reviews/create`;
            const response = await axios.post(endPoint, information, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept-Language': sessionStorage.getItem('lang')
                }
            });

            swal(t("El post fue creado con éxito"));
            setInformation({
                name: "",
                role: "",
                country: "",
                detail: "",
            });
            onClose()
            setSaveStatus(true)
            return response.data;
        } catch (error) {
            throw new ValidationError((error as Error).message);
        }
    };



    return (
        <div className="fixed flex justify-center p-24 top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className=" flex flex-col justify-center items-center bg-linkIt-500 m-32 rounded-[7px] border-[3px] border-linkIt-300 h-fit w-fit">

                <div>
                    <h1 className="text-3xl my-12">{t('Nueva Reseña')}</h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col justify-center items-center"
                    action=""
                >
                    <div className="flex flex-wrap justify-start mx-3 mb-6 px-16">

                        <div className="w-fit  mb-6">
                            <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">{t('Nombre Cliente')}</label>
                            <input
                                className={errors.name ? '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"' : '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'}
                                type="text"
                                name="name"
                                placeholder={errors.name ? "*" : ""}
                                autoComplete="off"
                                onChange={handleChange}
                                onBlur={handleBlurErrors}
                            />

                        </div>



                        <div className="w-fit px-3 mb-6">
                            <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2" >{t('País')}</label>
                            <input
                                className={errors.country ? '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"' : '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'}
                                type="text"
                                name="country"
                                placeholder={errors.country ? "*" : ""}
                                autoComplete="off"
                                onChange={handleChange}
                                onBlur={handleBlurErrors}
                            />
                        </div>

                        <div className=" w-full mb-6">
                            <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">{t('Detalle')}</label>
                            <textarea
                                className={errors.detail ? '"appearance-none block w-full bg-linkIt-500 text-blackk border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"' : '"appearance-none block w-full bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'}
                                name="detail"
                                autoComplete="off"
                                placeholder={errors.detail ? "*" : ""}
                                onChange={handleChange}
                                onBlur={handleBlurErrors}
                            ></textarea>
                        </div>
                    </div>
                    {errors.name || errors.country || errors.detail ? <span className="text-red-500">{t('Los campos marcados con * son obligatiorios')}</span> : null}
                    <div className="flex mb-4">
                        <button onClick={onClose} className="transparent-background-button mr-2">
                            {t('Volver')}
                        </button>
                        <button type="submit" className="background-button ml-2">
                            {t('Publicar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
