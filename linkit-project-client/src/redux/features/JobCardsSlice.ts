import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    jobOffers: [],
    allJobOffers: [],
    filterJobOffers: [],
    sortJobOffers: [],
    sortValues: {
        sortAlfa: '-',
        sortDate: 'recent',
        sortView: 'All'
    }
}

type JobOffer = {
    id: number,
    title: string,
    description: string,
    company: string,
    location: string,
    salary: number,
    archived: boolean,
    createdDate: Date,
    code: string,
}

const JobCardSlice = createSlice({
    name: 'jobCard',
    initialState,
    reducers: {
        applyFilters: (state, action) => {
            state.jobOffers = action.payload.filter((jobOffer: JobOffer) => jobOffer.archived !== true)
        },
        setJobOffers: (state, action) => {
            state.jobOffers = action.payload;
            state.allJobOffers = action.payload;
            state.filterJobOffers = action.payload;
            state.sortJobOffers = action.payload;
            state.sortValues.sortView = 'All'
        },

        setSearchJobOffers: (state, action) => {
            state.sortValues.sortView = 'All'
            const searchTerm = action.payload.toLowerCase();
            const filteredJobOffers = state.allJobOffers.filter((jobOffer: JobOffer) =>
                (jobOffer.title.toLowerCase().includes(searchTerm)) || (jobOffer.code.toLocaleLowerCase().includes(searchTerm))
            )
            state.filterJobOffers = filteredJobOffers
        },
        setSortJobOffers: (state, action) => {
            const { visibility, date, sortA } = action.payload;

            if (date === 'recent') {
                state.sortValues.sortAlfa = '-';
                state.filterJobOffers.reverse()
                state.sortValues.sortDate = 'recent';
            } else if (date === 'old') {
                state.sortValues.sortAlfa = '-';
                state.filterJobOffers.sort((a: JobOffer, b: JobOffer) => {
                    const dateA = new Date(a.createdDate);
                    const dateB = new Date(b.createdDate);
                    state.sortValues.sortDate = 'old';

                    return dateA.getTime() - dateB.getTime();
                });
            } else if (sortA === 'A-Z') {
                state.sortValues.sortDate = '-';
                state.filterJobOffers.sort((a: JobOffer, b: JobOffer) => {
                    const titleA = a.title.toLowerCase();
                    const titleB = b.title.toLowerCase();
                    state.sortValues.sortAlfa = 'A-Z';
                    return titleA.localeCompare(titleB);
                });
            } else if (sortA === 'Z-A') {
                state.sortValues.sortDate = '-';
                state.filterJobOffers.sort((a: JobOffer, b: JobOffer) => {
                    const titleA = a.title.toLowerCase();
                    const titleB = b.title.toLowerCase();
                    state.sortValues.sortAlfa = 'Z-A';
                    return titleB.localeCompare(titleA);
                });
            } else if (visibility === 'Visible') {
                state.filterJobOffers = state.allJobOffers.filter((jobOffer: JobOffer) => !jobOffer.archived);
                state.sortValues.sortView = 'Visible';
            } else if (visibility === 'Hidden') {
                state.filterJobOffers = state.allJobOffers.filter((jobOffer: JobOffer) => jobOffer.archived);
                state.sortValues.sortView = 'Hidden';
            } else if (visibility === 'All') {
                state.filterJobOffers = state.allJobOffers;
                state.sortValues.sortView = 'All';
            } 
        },
    }
})


export const { applyFilters, setJobOffers, setSearchJobOffers, setSortJobOffers} = JobCardSlice.actions;
export default JobCardSlice.reducer;


