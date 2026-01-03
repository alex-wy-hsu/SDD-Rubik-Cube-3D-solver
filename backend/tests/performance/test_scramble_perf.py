"""
Performance test for scramble generation
Verifies scramble generation completes in <100ms
"""
import pytest
import time
from src.services.scramble_service import ScrambleService


class TestScramblePerformance:
    """Test scramble generation performance"""

    @pytest.fixture
    def service(self):
        return ScrambleService()

    def test_single_scramble_generation_time(self, service):
        """Should generate scramble in <100ms"""
        start = time.time()
        scramble = service.generate_scramble()
        end = time.time()
        
        elapsed_ms = (end - start) * 1000
        
        assert elapsed_ms < 100, f"Scramble generation took {elapsed_ms:.2f}ms (limit: 100ms)"

    def test_average_generation_time_over_100_runs(self, service):
        """Should maintain <100ms average over 100 runs"""
        times = []
        
        for i in range(100):
            start = time.time()
            service.generate_scramble(seed=f"perf_test_{i}")
            end = time.time()
            times.append((end - start) * 1000)
        
        avg_time = sum(times) / len(times)
        
        assert avg_time < 100, f"Average generation time: {avg_time:.2f}ms (limit: 100ms)"

    def test_p95_generation_time(self, service):
        """Should have P95 <100ms"""
        times = []
        
        for i in range(100):
            start = time.time()
            service.generate_scramble(seed=f"p95_test_{i}")
            end = time.time()
            times.append((end - start) * 1000)
        
        times.sort()
        p95 = times[94]  # 95th percentile (index 94 of 0-99)
        
        assert p95 < 100, f"P95 generation time: {p95:.2f}ms (limit: 100ms)"

    def test_max_generation_time(self, service):
        """Should have max time <200ms (2x limit for outliers)"""
        max_time = 0
        
        for i in range(100):
            start = time.time()
            service.generate_scramble(seed=f"max_test_{i}")
            end = time.time()
            elapsed = (end - start) * 1000
            max_time = max(max_time, elapsed)
        
        assert max_time < 200, f"Max generation time: {max_time:.2f}ms (limit: 200ms)"

    def test_cached_retrieval_performance(self, service):
        """Should retrieve cached scramble in <1ms"""
        # Generate and cache
        seed = "cache_perf_test"
        service.generate_scramble(seed=seed)
        
        # Retrieve from cache
        start = time.time()
        service.get_scramble_by_seed(seed)
        end = time.time()
        
        elapsed_ms = (end - start) * 1000
        
        assert elapsed_ms < 1, f"Cache retrieval took {elapsed_ms:.2f}ms (limit: 1ms)"
