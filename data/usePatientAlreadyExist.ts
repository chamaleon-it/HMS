import useSWR from 'swr'

interface Props {
    name?: string;
    phoneNumber?: string;
    email?: string;
}

export default function usePatientAlreadyExist({ name, phoneNumber, email }: Props): {
    message: string;
    data: {
        isPatientAlreadyExists: boolean;
        patient: {
            _id: string;
            name: string;
            phoneNumber: string;
            email: string;
            gender: "Male" | "Female" | "Other" | "Prefer not to say",
            dateOfBirth: Date,
            address: string,
            mrn: string,
            blood: string
        };
    };
} | undefined {

    const params = new URLSearchParams()
    if (name) params.set("name", name)
    if (phoneNumber) params.set("phoneNumber", phoneNumber)
    if (email) params.set("email", email)

    const { data } = useSWR<{
        message: string, data: {
            isPatientAlreadyExists: boolean,
            patient: {
                _id: string,
                name: string,
                phoneNumber: string,
                email: string,
                gender: "Male" | "Female" | "Other" | "Prefer not to say",
                dateOfBirth: Date,
                address: string,
                mrn: string,
                blood: string
            }
        }
    }>("/patients/patient_already_exists?" + params.toString())
    return data

}
