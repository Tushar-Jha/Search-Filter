
import { Component, computed, inject, signal } from "@angular/core";
import { TableRow, Column } from "../../types/types";
import { SearchFilter } from "../SearchFilterComponent/search-filter.component";
import { ColumnInfo, TableData } from "../../data/sampleData";

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrl: 'home.component.css',
    imports: [SearchFilter]
})
export class HomeComponent {

    records = signal<TableRow[]>([]);
    columns = signal<Column[]>([]);
    selectedFilters = signal<Record<string, string | undefined>>({});

    filteredRecords = computed(() => {
        let filteredRecordsToReturn = this.records();
        const selectedFilters = this.selectedFilters();
        Object.keys(selectedFilters)?.filter((key: string) => selectedFilters?.[key] !== undefined)?.forEach((key: string) => {
            filteredRecordsToReturn = filteredRecordsToReturn?.filter((item) => 
                item?.[key as keyof TableRow].toString().toLowerCase().includes(selectedFilters?.[key]?.toString().toLowerCase() ?? '')
            )
        })

        return filteredRecordsToReturn;
    })

    changeFiltersHandler({ filters }: { filters: Record<string, string | undefined> } ) {
        this.selectedFilters.set({...filters} as Record<string, string | undefined>);
        this.selectedFilters();
    }

    ngOnInit() {
        this.records.set(TableData);
        this.columns.set(ColumnInfo);
    }
}