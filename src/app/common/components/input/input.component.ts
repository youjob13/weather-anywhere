import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements OnInit, ControlValueAccessor {
  delay = input<number>(0);
  inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  value = signal<string | null>(null);
  disabled = signal<boolean>(false);

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    const inputRef = this.inputRef();

    if (inputRef == null) {
      throw new Error('The input tag is not specified');
    }

    fromEvent(inputRef.nativeElement, 'input')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(this.delay()),
        map((event) => (event.target as HTMLInputElement).value),
        distinctUntilChanged()
      )
      .subscribe((value) => this.change(value));
  }

  private onTouched?() {}
  private onChange?(_: unknown) {}

  writeValue(valueToWrite: string): void {
    this.value.set(valueToWrite);
  }
  registerOnChange(fn: (_: unknown) => unknown): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => unknown): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected change(value: string) {
    if (this.onChange) {
      this.value.set(value);
      this.onChange(value);
    }
  }
}
