import { Component, computed, ElementRef, input, model, output, signal, viewChild } from "@angular/core";
import { Column } from "../../types/types";

@Component({
    selector: 'app-search-filter',
    templateUrl: 'search-filter.component.html',
    styleUrl: 'search-filter.component.css'
})
export class SearchFilter {

    readonly filterColumns = input<Column[]>([]);
    columnPickerSelectedIndex = model<number>(0);
    showColumnPicker = model<boolean>(false);
    columnPickerSelectedIndexFinalised = model<boolean>(false);

    filterInputElement = viewChild<ElementRef<HTMLInputElement>>('filterInput');
    searchInputElement = viewChild<ElementRef<HTMLInputElement>>('searchInput');

    selectedFilters = signal<Record<string, string | undefined>>({});

    changeFilters = output<{ filters: Record<string, string | undefined>}>();

    availableFilters = computed(() => {
        let availableFiltersToReturn = this.filterColumns();
        Object.keys(this.selectedFilters())?.forEach((key) => {
            availableFiltersToReturn = availableFiltersToReturn?.filter((item) => item?.id !== key)
        })

        return availableFiltersToReturn;
    })

    beforeInputHandler(event: InputEvent) {
        if(this.showColumnPicker()) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        if(event.data === '@') {
            this.showColumnPicker.set(true);
        } else {
            if(event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') {   


                const value = this.searchInputElement()?.nativeElement?.innerHTML;
                if(value) {
                    const sel = window.getSelection();
                    if (!sel || !sel.rangeCount) return;

                    const range = sel.getRangeAt(0);
                    const container = range.startContainer;
                    const offset = range.startOffset;

                    if (container.nodeType === Node.ELEMENT_NODE) {
                        if(container.childNodes[offset - 1]?.nodeName === 'SPAN') {
                            const spanToDelete = container.childNodes[offset - 1];
                            if (spanToDelete) {
                                if(spanToDelete instanceof HTMLElement) {
                                    const upadtedFilters = this.selectedFilters();
                                    delete upadtedFilters[spanToDelete.id];

                                    this.selectedFilters.set(upadtedFilters);
                                    this.changeFilters.emit({ filters: this.selectedFilters()});
                                }
                                event.preventDefault();
                                event.stopPropagation();
                                spanToDelete.remove();
                            }
                        }
                    }
                }
            } else {
                event.preventDefault();
                event.stopPropagation();
            }
        }

    }

    inputHandler(event: Event) {
    }

    keyDownHandler(event: KeyboardEvent) {

        if(event.key === 'Escape') {
            const searchInputElement = this.searchInputElement();

            if(!!searchInputElement) {
                searchInputElement.nativeElement.innerHTML = searchInputElement.nativeElement.innerHTML.split('').filter((char) => char !== '@').join('');
                this.putCaretAtEnd();
            }

            this.showColumnPicker.set(false);
            this.columnPickerSelectedIndexFinalised.set(false);
        }

        if(event.key === 'Enter') {
            this.enterHandler(event);
        }
        
        if(event.key === 'ArrowUp') {
            this.arrowUpHandler(event);
        } 
        
        if(event.key === 'ArrowDown') {
            this.arrowDownHandler(event);
        }
    }

    enterHandler(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        if(this.showColumnPicker()) {
            if(this.columnPickerSelectedIndexFinalised()) {
                this.showColumnPicker.set(false);
                this.columnPickerSelectedIndexFinalised.set(false);
            }
            else {
                setTimeout(() => {
                    this.filterInputElement()?.nativeElement?.focus();
                }, 0)
                this.columnPickerSelectedIndexFinalised.set(true);
            }
        }
    }

    arrowUpHandler(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        if(this.showColumnPicker()) {
            if(this.columnPickerSelectedIndex() > 0) {
                this.columnPickerSelectedIndex.set(this.columnPickerSelectedIndex() - 1);
            }
        }
    }

    arrowDownHandler(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        if(this.showColumnPicker()) {
            if(this.columnPickerSelectedIndex() < this.availableFilters()?.length -1) {
                this.columnPickerSelectedIndex.set(this.columnPickerSelectedIndex() + 1);
            }
        }
    }

    filterInputChangeHandler(event: Event) {
        const text = (event?.target as HTMLInputElement)?.value;
        if(!!text) {
            const upadtedFilters = {
                ...this.selectedFilters(),
                [(this.availableFilters()?.[this.columnPickerSelectedIndex()]).id]: text
            }

            this.addFilterToContent((this.availableFilters()?.[this.columnPickerSelectedIndex()]).id,(this.availableFilters()?.[this.columnPickerSelectedIndex()]).label, text);
            this.selectedFilters.set(upadtedFilters);
            this.changeFilters.emit({ filters: this.selectedFilters() });
            this.putCaretAtEnd();
        }

        this.showColumnPicker.set(false);
        this.columnPickerSelectedIndexFinalised.set(false);
        this.searchInputElement()?.nativeElement?.focus();
        
    }

    addFilterToContent(filterId: string, filterText: string, text: string) {
        const ele =  `<span id="${filterId}" contenteditable="false" class="added-filter">${filterText}: ${text}</span>`;
        const currentText = this.searchInputElement()?.nativeElement?.innerHTML;
        const searchInputElement = this.searchInputElement();
        if(!!searchInputElement) {
            searchInputElement.nativeElement.innerHTML = `${currentText?.slice(0, currentText.length - 1)}${ele}`;   
        }
    }

    putCaretAtEnd() {
        const el = this.searchInputElement()?.nativeElement;
        if(!!el){
            const range = document.createRange();
            const sel = window.getSelection();

            range.selectNodeContents(el);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
            el.focus();
        }
    }

    getCaretPositionInContentEditable(): number {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return 0;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(range.startContainer);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        return preCaretRange.toString().length;
    }

    ngOnInit() {
        
    }
}