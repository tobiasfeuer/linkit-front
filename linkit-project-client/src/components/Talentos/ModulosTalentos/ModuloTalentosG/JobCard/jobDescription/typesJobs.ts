export type JobDescriptionProps = {
    expirationDate?: string
    jobType: string
    salary: any
    currency: string
    createdAt?: string
    _id: string
    code: string
    title: string
    description: string
    type: string
    location: string
    modality: string
    stack: string[]
    aboutUs: string
    aboutClient: string
    responsabilities: string[]
    requirements: string[]
    niceToHave: string[]
    benefits: string[]
    archived: boolean
    company: string
    status: string
    en?: {
        title: string
        description: string
        location: string
        modality: string
        stack: string[]
        aboutUs: string
        aboutClient: string
        responsabilities: string[]
        requirements: string[]
        niceToHave: string[]
        benefits: string[]
    }
}

export type State = {
    Authentication: {
        isAuthenticated: boolean
        user: {
            active: boolean;
            cv: {
                cloudinaryId: string,
                fileName: string
            },
            role: string
        }
    }
}