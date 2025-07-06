import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InputDialogComponent } from './input-dialog.component';

describe('InputDialogComponent', () => {
  let component: InputDialogComponent;
  let fixture: ComponentFixture<InputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit confirm with reason', () => {
    spyOn(component.confirm, 'emit');
    component.reason = 'test reason';
    const btn = fixture.debugElement.query(By.css('button.confirm'));
    btn.triggerEventHandler('click');
    expect(component.confirm.emit).toHaveBeenCalledWith('test reason');
  });

  it('should emit cancel on cancel button click', () => {
    spyOn(component.cancel, 'emit');
    const btn = fixture.debugElement.query(By.css('button.cancel'));
    btn.triggerEventHandler('click');
    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
