package com.bookings.service;

import com.bookings.dto.BookingResponseDTO;
import com.bookings.dto.CancellationResponseDTO;
import com.bookings.dto.CreateBookingDTO;
import com.bookings.entity.Booking;
import com.bookings.entity.Court;
import com.bookings.enums.BookingStatus;
import com.bookings.enums.CourtStatus;
import com.bookings.repository.BookingRepository;
import com.bookings.repository.CourtRepository;
import com.users.entity.User;
import com.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.RecordComponent;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CourtRepository courtRepository;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void create_ShouldPersistAndReturnResponse() {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", 1L);
        Court court = new Court();
        ReflectionTestUtils.setField(court, "id", 2L);
        court.setStatus(CourtStatus.ACTIVE);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(courtRepository.findById(2L)).thenReturn(Optional.of(court));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            try {
                var idField = Booking.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(b, 10L);
            } catch (Exception ignored) {}
            return b;
        });

        var start = LocalDateTime.now().plusHours(1);
        var end = start.plusHours(1);
        CreateBookingDTO dto = new CreateBookingDTO(1L, 2L, start, end);

        BookingResponseDTO res = bookingService.create(dto);

        assertNotNull(res);
        assertEquals(10L, res.id());
        assertEquals(1L, res.userId());
        assertEquals(2L, res.courtId());
        assertEquals(start, res.startTime());
        assertEquals(end, res.endTime());
        assertNotNull(res.status());
    }

    @Test
    void create_ShouldThrow_WhenEndBeforeStart() {
        User user = new User();
        Court court = new Court();
        court.setStatus(CourtStatus.ACTIVE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(courtRepository.findById(2L)).thenReturn(Optional.of(court));

        var start = LocalDateTime.now().plusHours(2);
        var end = start.minusMinutes(30);
        CreateBookingDTO dto = new CreateBookingDTO(1L, 2L, start, end);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.create(dto));
        assertTrue(ex.getMessage().toLowerCase().contains("end time"));
    }

    @Test
    void create_ShouldThrow_WhenCourtInactive() {
        User user = new User();
        Court court = new Court();
        court.setStatus(CourtStatus.INACTIVE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(courtRepository.findById(2L)).thenReturn(Optional.of(court));

        var start = LocalDateTime.now().plusHours(1);
        var end = start.plusHours(1);
        CreateBookingDTO dto = new CreateBookingDTO(1L, 2L, start, end);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.create(dto));
        assertTrue(ex.getMessage().toLowerCase().contains("inactive"));
    }

    // ---------------- testes adicionados ----------------

    @Test
    void create_ShouldThrow_WhenUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        var start = LocalDateTime.now().plusHours(1);
        CreateBookingDTO dto = new CreateBookingDTO(1L, 2L, start, start.plusHours(1));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.create(dto));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void create_ShouldThrow_WhenCourtNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(courtRepository.findById(2L)).thenReturn(Optional.empty());

        var start = LocalDateTime.now().plusHours(1);
        CreateBookingDTO dto = new CreateBookingDTO(1L, 2L, start, start.plusHours(1));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.create(dto));
        assertEquals("Court not found", ex.getMessage());
    }

    @Test
    void create_ShouldApplyPeakPrice_ForOpenCourt() {
        Court court = new Court();
        court.setStatus(CourtStatus.ACTIVE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(courtRepository.findById(2L)).thenReturn(Optional.of(court));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        // 18h-19h e horario de pico: 100 * 1.20 = 120.00 (data fixa para nao depender do relogio)
        var start = LocalDateTime.of(2030, 1, 15, 18, 0);
        bookingService.create(new CreateBookingDTO(1L, 2L, start, start.plusHours(1)));

        ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(captor.capture());
        assertEquals(0, new BigDecimal("120.00").compareTo(captor.getValue().getCourtPrice()));
    }

    @Test
    void cancel_ShouldRefundFully_WhenMoreThan24HoursBefore() {
        Booking booking = scheduledBookingStartingIn(30);
        when(bookingRepository.findById(5L)).thenReturn(Optional.of(booking));

        CancellationResponseDTO res = bookingService.cancel(5L);

        assertEquals(0, new BigDecimal("100.00").compareTo(refundOf(res)));
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancel_ShouldNotRefund_WhenLessThan12HoursBefore() {
        Booking booking = scheduledBookingStartingIn(3);
        when(bookingRepository.findById(5L)).thenReturn(Optional.of(booking));

        CancellationResponseDTO res = bookingService.cancel(5L);

        assertEquals(0, BigDecimal.ZERO.compareTo(refundOf(res)));
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
    }

    @Test
    void cancel_ShouldThrow_WhenAlreadyCancelled() {
        Booking booking = scheduledBookingStartingIn(30);
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(5L)).thenReturn(Optional.of(booking));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.cancel(5L));
        assertEquals("Booking already cancelled", ex.getMessage());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void delete_ShouldThrow_WhenBookingNotFound() {
        when(bookingRepository.existsById(99L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.delete(99L));
        assertEquals("Booking not found", ex.getMessage());
        verify(bookingRepository, never()).deleteById(any());
    }


    private Booking scheduledBookingStartingIn(long hours) {
        LocalDateTime start = LocalDateTime.now().plusHours(hours).plusMinutes(5);
        Booking b = new Booking();
        b.setStartTime(start);
        b.setEndTime(start.plusHours(1));
        b.setCourtPrice(new BigDecimal("100.00"));
        b.setStatus(BookingStatus.SCHEDULED);
        return b;
    }

    private static BigDecimal refundOf(CancellationResponseDTO dto) {
        try {
            for (RecordComponent rc : dto.getClass().getRecordComponents()) {
                if (rc.getType() == BigDecimal.class) {
                    return (BigDecimal) rc.getAccessor().invoke(dto);
                }
            }
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
        throw new IllegalStateException("Nenhum BigDecimal em CancellationResponseDTO");
    }
}
