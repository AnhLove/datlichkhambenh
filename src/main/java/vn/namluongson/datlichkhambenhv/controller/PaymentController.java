package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.payment.CreatePaymentRequest;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.service.interfaces.IPaymentService;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Validated
public class PaymentController {

    private final IPaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse> getPaymentByAppointmentId(@PathVariable @Positive Long appointmentId) {
        return ResponseEntity.ok(paymentService.getPaymentByAppointmentId(appointmentId));
    }

    @PatchMapping("/appointment/{appointmentId}/confirm")
    public ResponseEntity<ApiResponse> confirmPayment(@PathVariable @Positive Long appointmentId) {
        return ResponseEntity.ok(paymentService.confirmPayment(appointmentId));
    }
}